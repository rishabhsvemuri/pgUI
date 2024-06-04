import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  runScript: () => ipcRenderer.send('run-script'),
  addItem: (newItem) => ipcRenderer.send('add-item', newItem),
  onItemAdded: (callback) => ipcRenderer.on('item-added', (event, newItem) => callback(newItem)),
  updateItemValue: (itemId, field, val) => ipcRenderer.send('update-item', itemId, field, val),
  updateCategory: (selectedItem, selectedCategory, itemId) => ipcRenderer.send('update-category', selectedItem, selectedCategory, itemId),
  // onRefreshPDF: (callback) => ipcRenderer.on('refresh-pdf', (event, savePath) => callback(savePath)),
  onRefreshPDF: (callback) => ipcRenderer.on('refresh-pdf', callback),
  savePath: (pathText) => ipcRenderer.send('save-path', pathText),
  loadJson: (category, id) => ipcRenderer.send('load-json', category, id),
  onjsonGen: (callback, id) => ipcRenderer.on('json-gen', callback, id),
  onCreatePage: (callback, id) => ipcRenderer.on('create-page', callback, id),
});