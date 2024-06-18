import { app, shell, BrowserWindow, ipcMain, protocol, net } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
const { exec } = require('child_process');
const url = require('url')
const path = require('path');
const fs = require('fs').promises;
const pgInstall = 'if (!requireNamespace("BiocManager", quietly = TRUE))\ninstall.packages("BiocManager")\nBiocManager::install("plotgardener")\nBiocManager::install("plotgardenerData")'
let mainWindow;
let plots = new Map();
let savePath = path.join(app.getPath('temp'), 'pgUIOutput.pdf');
const writePath = path.join(app.getPath('temp'), 'written.R');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 670,
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

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.on('save-path', (event, pathText) => {
    savePath = pathText.toString();
  });

  ipcMain.on('run-script', async (event) => {
    if (!mainWindow) {
      console.error('mainWindow is not defined');
      return;
    }

    try {
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
    const curr = plots.get(itemId);
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
  const width = Number(plots.get('a0').get('width'))
  const height = Number(plots.get('a0').get('height'))
  await fs.appendFile(writePath, `${pgInstall}\n`);
  const pather = `pdf("${savePath}", width = ${width + 2}, height = ${height + 2})\n`;
  const library = `library(plotgardener)\n`
  const genes = `library(plotgardenerData)\ndata("IMR90_HiC_10kb")\n`
  await fs.appendFile(writePath, pather);
  await fs.appendFile(writePath, library);
  await fs.appendFile(writePath, genes);
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