const { app, BrowserWindow } = require('electron');
const fs = require('fs')
const path = require('path');
const url = require('url');
const mw = require("./middleware")
const DB = require("./database")
const { appPath, pwd } = require("./utils");

let mainWindow;

function createWindow () {
  const startUrl = process.env.ELECTRON_START_URL ||url.format({
        pathname: path.join(appPath(), './index.html'),
        protocol: 'file:',
        slashes: true,
      });
  mainWindow = new BrowserWindow({ width: 1600, height: 1000 });
  mainWindow.loadURL(startUrl).catch((err) => console.log(`Failed to load index.html :${err}`));
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

//Start
if(fs.existsSync(path.join(pwd(),"sql/")) === false){
  fs.mkdirSync(path.join(pwd(),'sql/'))
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