import { app, shell, BrowserWindow, ipcMain, protocol, net, dialog } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
const { exec } = require('child_process');
const url = require('url')
const path = require('path');
const npfs = require('fs');
const fs = require('fs').promises;



// R script installation commands for required packages
const pgInstall = 'if (!requireNamespace("BiocManager", quietly = TRUE)) install.packages("BiocManager")\nif (!requireNamespace("plotgardener", quietly = TRUE)) BiocManager::install("plotgardener")\nif (!requireNamespace("plotgardenerData", quietly = TRUE)) BiocManager::install("plotgardenerData")'

// Variables for the main window, plot map, and file paths
let mainWindow;
let plots = new Map();
let duplicatePlots = [];
let annotationsDuplicate = [];

let savePath = path.join(app.getPath('temp'), 'pgUIOutput.pdf');
const writePath = path.join(app.getPath('temp'), 'written.R');
const sessionsFilePath = path.join(app.getPath('userData'), 'savedSessions.json');

const userSessionsPath = path.join(app.getPath('userData'), 'user_sessions');

// Create the folder if it doesn't exist using npfs
if (!npfs.existsSync(userSessionsPath)) {
    npfs.mkdirSync(userSessionsPath, { recursive: true });
}


// Function to create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 1000,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      enableRemoteModule: false,
    }
  });

  // Show the window when it's ready
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  // Prevent external links from opening in the app, use the browser instead
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer based on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // IPC event handler to set the save path for the output
  ipcMain.on('save-path', (event, pathText) => {
    savePath = pathText.toString();
  });

  // IPC handler for running the R script, validates inputs before running
  // Once validated the app calls runScript and refreshes the PDF
  ipcMain.on('run-script', async (event) => {
    if (!mainWindow) {
      console.error('mainWindow is not defined');
      return;
    }
    await mainWindow.webContents.send('check-valid');
  
    // Create a promise to wait for the check-valid response
    const isValid = await new Promise((resolve) => {
      ipcMain.once('check-valid-response', (event, isValid) => {
        console.log(isValid);
        resolve(isValid); // Resolve the promise with the validity status
      });
    });
  
    // Check the validity and handle invalid case
    if (!isValid) {
      mainWindow.webContents.send('message', 'Error: Invalid inputs');
      return;
    }

    try {
      console.log('Generating and writing commands')
      mainWindow.webContents.send('message', 'Generating and writing commands');
      await writeScript();
      mainWindow.webContents.send('message', 'Command generated, written to file, running R Script...');
      const command = `/usr/local/bin/Rscript "${writePath}"`;
      exec(command, (error, stdout) => {
        if (error) {
          console.error(`Error executing R script: ${error.message}`);
          mainWindow.webContents.send('message', `Error executing R script: ${error.message}`);
          return;
        }
        if(stdout){
          mainWindow.webContents.send('refresh-pdf', savePath);
          mainWindow.webContents.send('message', '');
        }
      });
    } catch (err) {
      console.error('Error writing script or running R script:', err);
    }
  });

  // IPC handler to add a new plot and notify the renderer process
  ipcMain.on('add-item', (event, newItem) => {
    if (!mainWindow) {
      console.error('mainWindow is not defined');
      return;
    }
    mainWindow.webContents.send('item-added', newItem);
  });

  // IPC handler to update the category of a plot
  // Plot will be deleted if the category and name become null
  ipcMain.on('update-category', (event, itemName, category, itemId) => {
    if (category == null && itemName == null) {
      plots.delete(itemId);
      return;
    }
    plots.set(itemId, new Map());
    plots.get(itemId).set('maker', `${category}(`);
  });

  
  // IPC handler to update a specific item (field and value) of a plot
  ipcMain.on('update-item', (event, itemId, field, val) => {
    let curr = plots.get(itemId);
    if (curr == null) {
      curr = plots.set(itemId, null);
    }
    curr.set(field, val);
  });

  // IPC handler to load a JSON file and send its contents to the renderer
  ipcMain.on('load-json', async (event, category, id) => {
    const fullPath = path.join('../../resources/.json', `${category}` + '.json');
    let jsonData = require(fullPath);
    const thing = JSON.stringify(jsonData);
    const thing2 = JSON.parse(thing);
    if (category == 'pageCreate') {
      mainWindow.webContents.send('create-page', thing2, id);
    }
    else {
      mainWindow.webContents.send('json-gen', thing2, id);
    }

  });

  // IPC handler to read the written R script file for code mirror
  ipcMain.handle('read-written.R', async () => {
    try {
        const data = await fs.readFile(writePath, 'utf8');
        return data;
    } catch (error) {
        console.error('Error reading written.R file:', error);
        return '';
    }
  });

  // IPC handler to save new content to the written R script file for code mirror
  ipcMain.handle('save-written.R', async (event, newContent) => {
    try {
      await fs.writeFile(writePath, newContent, 'utf8');
      return true; // Indicate success
    } catch (error) {
      console.error('Error writing to written.R file:', error);
      return false; // Indicate failure
    }
  })

  // IPC handler to get the icon image path for a plot category
  ipcMain.on('icon-image-path', (plotcatagory) => {
    try{
      const realtive_path = path.join(`../assets/plotIcons/${plotcatagory}.png`);
      return realtive_path;
    } catch (error){
      console.error('Error getting icon image:', error);
      return false;
    }
  })

  // IPC handler to download code, saving it to a file using a dialog
  ipcMain.on('download-code', async (event, content) => {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Save code file',
      defaultPath: path.join(app.getPath('downloads'), 'pgUICode.R'),
      buttonLabel: 'Save',
      filters: [{ name: 'R Files', extensions: ['R'] }]
  });
  fs.writeFile(filePath, content, (err) => {
    console.log('done')
  })
})

  // Handle custom 'atom' protocol requests
  // Allows to fetch files from userside safley
  protocol.handle('atom', (request) => {
    const filePath = request.url.slice('atom://'.length)
    return net.fetch(url.pathToFileURL(filePath).toString())
  })
});

// Get current plots and annotations duplicate data
ipcMain.on('getPlotsDuplicate', (event) => {
  event.returnValue = duplicatePlots; // Send back duplicatePlots synchronously
});

ipcMain.on('getAnnotationsDuplicate', (event) => {
  event.returnValue = annotationsDuplicate; // Send back annotationsDuplicate synchronously
});

// Update plots duplicate data
ipcMain.on('updatePlotsDuplicate', (event, plots) => {
  duplicatePlots = plots;
});

// Update annotations duplicate data
ipcMain.on('updateAnnotationsDuplicate', (event, annotations) => {
  annotationsDuplicate = annotations;
});

ipcMain.handle('createNewSession', async (event, sessionName) => {
  const sessionPath = path.join(userSessionsPath, `${sessionName}.json`);
  try {
    // Reset duplicatePlots and annotationsDuplicate to empty arrays
    duplicatePlots = [];
    annotationsDuplicate = [];

    // Create an empty JSON file for the new session
    await fs.writeFile(sessionPath, JSON.stringify({ plots: [], annotations: [] }, null, 2));

    return { success: true };
  } catch (error) {
    console.error('Failed to create new session:', error);
    return { success: false, message: error.message };
  }
});

// Refactor saveSession function to be callable directly within main/index.js
async function saveSession(sessionData, sessionName) {
  const sessionPath = path.join(userSessionsPath, `${sessionName}.json`);
  try {
    await fs.writeFile(sessionPath, JSON.stringify(sessionData, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Failed to save session:', error);
    return { success: false, message: error.message };
  }
}

// Update ipcMain handler to use the refactored saveSession function
ipcMain.handle('saveSession', async (event, sessionData, sessionName) => {
  return await saveSession(sessionData, sessionName);
});

// Load session data from a file
ipcMain.handle('loadSession', async (event, sessionName) => {
  console.log("Start of Load Session")
  const sessionPath = path.join(app.getPath('userData'), `${sessionName}.json`);
  console.log("Got Session Path")
  try {
    console.log("About to readFile")
    const data = await fs.readFile(sessionPath, 'utf8');
    console.log("Got Data")
    const sessionData = JSON.parse(data);
    console.log("Parsed Data")
    duplicatePlots = sessionData.plots || [];
    console.log("Set Dup Plots")
    annotationsDuplicate = sessionData.annotations || [];
    console.log("Set Annotations")
    return sessionData;
  } catch (error) {
    console.error('Failed to load session:', error);
    return null;
  }
});

// Emit an event to notify of a session switch
ipcMain.on('emitSessionSwitch', () => {
  mainWindow.webContents.send('sessionSwitch');
});

ipcMain.handle('get-sessions-list', async () => {
  try {
    const files = await fs.readdir(userSessionsPath); // Read the contents of the user_sessions directory
    const sessions = files
      .filter(file => file.endsWith('.json')) // Only include JSON files
      .map(file => file.replace('.json', '')); // Remove the .json extension to get the session name

    return { success: true, sessions };
  } catch (error) {
    console.error('Error reading sessions list:', error);
    return { success: false, message: 'Failed to read sessions list.' };
  }
});



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Helper function to write the R script
async function writeScript() {
  await clearPath();
  await startScript();
  await writeCommands();
  await closeScript();
}


// Helper function to start the R script with necessary libraries
async function startScript() {
  const width = plots.get('a0').get('width') === undefined || plots.get('a0').get('width') === '' ? Number(8.5) : Number(plots.get('a0').get('width'));
  const height = plots.get('a0').get('height') === undefined || plots.get('a0').get('height') === '' ? Number(11) : Number(plots.get('a0').get('height'));
  await fs.appendFile(writePath, `${pgInstall}\n`);
  const pather = `pdf("${savePath}", width = ${width + 2}, height = ${height + 2})\n`;
  const library = `library(plotgardener)\n`
  const genes = `library(plotgardenerData)\ndata("IMR90_HiC_10kb")\n`
  await fs.appendFile(writePath, pather);
  await fs.appendFile(writePath, library);
  await fs.appendFile(writePath, genes);
}

//Helper function to write commands baased of fields of plots in the plot map
async function writeCommands() {
  for (let [id, plot] of plots) {
    let command = `${id} <- ${plot.get('maker').toString()}`;
    for (let [variable, value] of plot) {
      if (value !== undefined && variable !== 'maker') {
        const line = `${variable} = ${value.toString()}, `;
        command += line;
      }
    }
    command += ')\n';
    await fs.appendFile(writePath, command);
  }
}

async function closeScript() {
  await fs.appendFile(writePath, 'dev.off()\n');
}

async function clearPath() {
  await fs.writeFile(writePath, '');
}