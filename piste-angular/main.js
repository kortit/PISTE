const { app, BrowserWindow } = require('electron')
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: path.join(__dirname, 'electron-icon.png')
  })

  win.loadFile('dist/piste/index.html')
}

app.whenReady().then(createWindow)