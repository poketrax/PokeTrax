import { app, BrowserWindow } from 'electron';
const fs = require('fs')
const path = require('path');
const url = require('url');
const mw = require("./controls/middleware")
const DB = require("./controls/database")

let mainWindow;

function createWindow () {
  const startUrl = process.env.ELECTRON_START_URL ||url.format({
        pathname: path.join(DB.appPath(), './index.html'),
        protocol: 'file:',
        slashes: true,
      });
  mainWindow = new BrowserWindow({ width: 1600, height: 100 });
  mainWindow.loadURL(startUrl).catch((err) => console.log(`Failed to load index.html :${err}`));
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

//Start
if(fs.existsSync(path.join(DB.pwd(),"sql/")) === false){
  fs.mkdirSync(path.join(DB.pwd(),'sql/'))
}

mw.start()

//Electron starts
app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});