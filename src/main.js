const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const mw = require("./middleware")


let mainWindow;

function createWindow () {
  console.log(path.join(mw.pwd(), '/index.html'))
  const startUrl = process.env.ELECTRON_START_URL ||url.format({
        pathname: path.join(mw.pwd(), '/index.html'),
        protocol: 'file:',
        slashes: true,
      });
  mainWindow = new BrowserWindow({ width: 1200, height: 800 });
  mainWindow.loadURL(startUrl);
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
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