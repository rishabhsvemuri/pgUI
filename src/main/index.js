import { app, shell, BrowserWindow, ipcMain, protocol, net, dialog } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
const { exec, spawn } = require('child_process');
const url = require('url')
const path = require('path');
const fs = require('fs').promises;
const pgInstall = 'if (!requireNamespace("BiocManager", quietly = TRUE)) install.packages("BiocManager")\nif (!requireNamespace("plotgardener", quietly = TRUE)) BiocManager::install("plotgardener")\nif (!requireNamespace("plotgardenerData", quietly = TRUE)) BiocManager::install("plotgardenerData")'
let mainWindow;
let plots = new Map();
let savePath = path.join(app.getPath('temp'), 'pgUIOutput.pdf');
const writePath = path.join(app.getPath('temp'), 'written.R');
let rSession; // persistent r session

function startRSession() {
  rSession = spawn("R", ["--vanilla"], { stdio: ["pipe", "pipe", "pipe"] });

  rSession.stdout.on("data", (data) => {
      console.log(data.toString())
      if (data.toString().includes('null device')) {
        mainWindow?.webContents.send('refresh-pdf', savePath);
      }
  });

  rSession.stderr.on("data", (data) => {
      console.log(data.toString())
      if (!(data.toString().includes('masked') || data.toString().includes('plotgardener'))) {
        mainWindow?.webContents.send('message', `Error: ${data.toString()}`);
      }
  });

  rSession.on("close", (code) => {
      console.log(`R process exited with code ${code}`);
      console.log('Restarting')
      startRSession();
  });

  // Load necessary libraries on startup
  rSession.stdin.write('if (!requireNamespace("BiocManager", quietly = TRUE)) install.packages("BiocManager")\n')
  rSession.stdin.write('if (!requireNamespace("plotgardener", quietly = TRUE)) BiocManager::install("plotgardener")\n')
  rSession.stdin.write('if (!requireNamespace("plotgardenerData", quietly = TRUE)) BiocManager::install("plotgardenerData")\n')
  rSession.stdin.write('library(plotgardener)\n')
  rSession.stdin.write('library(plotgardenerData)\n')
  rSession.stdin.write('data("IMR90_HiC_10kb")\n')
  rSession.stdin.write('print("Libraries Loaded")\n');
}

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

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

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
  startRSession();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.on('save-path', (event, pathText) => {
    savePath = pathText.toString();
  });

  ipcMain.on('run-script', async (event) => {
    if (!rSession) {
      console.error('R session is not active');
      mainWindow?.webContents.send('message', 'Error: R session is not active');
      return;
    }
  
    await mainWindow?.webContents.send('check-valid');
  
    const isValid = await new Promise((resolve) => {
      ipcMain.once('check-valid-response', (event, isValid) => {
        resolve(isValid);
      });
    });
  
    if (!isValid) {
      mainWindow?.webContents.send('message', 'Error: Invalid inputs');
      return;
    }
  
    try {
      console.log('Generating and writing commands');
      mainWindow?.webContents.send('message', 'Generating and writing commands');
      await writeScript();
  
      mainWindow?.webContents.send('message', 'Running commands in R session...');
  
      // Pass commands to the R session
      const scriptContent = await fs.readFile(writePath, 'utf8');
      await rSession.stdin.write(`${scriptContent}\n`);
  
      mainWindow?.webContents.send('message', 'Commands executed successfully');
      // Use R output null device code to show pdf
    } catch (err) {
      console.error('Error running commands in R session:', err);
      mainWindow?.webContents.send('message', `Error: ${err.message}`);
    }
  });  

  ipcMain.on('add-item', (event, newItem) => {
    if (!mainWindow) {
      console.error('mainWindow is not defined');
      return;
    }
    mainWindow.webContents.send('item-added', newItem);
  });

  ipcMain.on('update-category', (event, itemName, category, itemId) => {
    if (category == null && itemName == null) {
      plots.delete(itemId);
      return;
    }
    plots.set(itemId, new Map());
    plots.get(itemId).set('maker', `${category}(`);
  });

  ipcMain.on('update-item', (event, itemId, field, val) => {
    let curr = plots.get(itemId);
    if (curr == null) {
      curr = plots.set(itemId, null);
    }
    curr.set(field, val);
  });

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

  ipcMain.handle('read-written.R', async () => {
    try {
        const data = await fs.readFile(writePath, 'utf8');
        return data;
    } catch (error) {
        console.error('Error reading written.R file:', error);
        return '';
    }
  });

  ipcMain.handle('save-written.R', async (event, newContent) => {
    try {
      await fs.writeFile(writePath, newContent, 'utf8');
      return true; // Indicate success
    } catch (error) {
      console.error('Error writing to written.R file:', error);
      return false; // Indicate failure
    }
  })

  ipcMain.on('icon-image-path', (plotcatagory) => {
    try{
      const realtive_path = path.join(`../assets/plotIcons/${plotcatagory}.png`);
      return realtive_path;
    } catch (error){
      console.error('Error getting icon image:', error);
      return false;
    }
  })

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

  

  protocol.handle('atom', (request) => {
    const filePath = request.url.slice('atom://'.length)
    return net.fetch(url.pathToFileURL(filePath).toString())
  })
});



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

async function writeScript() {
  await clearPath();
  await startScript();
  await writeCommands();
  await closeScript();
}

async function startScript() {
  await fs.appendFile(writePath, `rm(list = ls())\n`) // clear all the previous commands
  await fs.appendFile(writePath, `while (dev.cur() > 1) dev.off()\n`) // check if any pdfs are open and close them
  const width = plots.get('a0').get('width') === undefined || plots.get('a0').get('width') === '' ? Number(8.5) : Number(plots.get('a0').get('width'));
  const height = plots.get('a0').get('height') === undefined || plots.get('a0').get('height') === '' ? Number(11) : Number(plots.get('a0').get('height'));
  const pather = `pdf("${savePath}", width = ${width + 2}, height = ${height + 2})\n`;
  await fs.appendFile(writePath, pather);
}

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