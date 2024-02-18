import { app, BrowserWindow, screen, components } from 'electron';
import express from 'express';
import http from 'http';
import { dirname, join } from 'path';
import {fileURLToPath} from 'url';
import getPort from 'get-port';

async function startServer() {
  
  const expressApp = express();
  const server = http.Server(expressApp);

  const port = await getPort({ port: [61234, 61235, 61236] });
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  expressApp.use(express.static(join(__dirname, 'dist/piste/')));
  
  // always serve index.html for all routes
  expressApp.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist/piste/index.html'));
  });
  app.commandLine.appendSwitch('widevine-cdm-path', 'C:/Users/dumou/Dev/PISTE/piste-angular')
  app.commandLine.appendSwitch('widevine-cdm-version', '4.10.2710.0')
  app.on('ready', async () => {
    console.log(`Electron is ready`);   
    await components.whenReady();
    console.log('Components ready:', components.status());   
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    const mainWindow = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true,
      },
      width: width,
      height: height
    });
    console.log(`Starting express server...`);  
    server.listen(port, 'localhost', () => {
      console.log(`Express server started. Listening on port ${port}`);
      var localUrl = new URL(`http://localhost:${port}/index.html`).toString();
      console.log(`Loading window to URL ${localUrl}`);
      mainWindow.loadURL(localUrl);
      }
    );
  });
}

startServer();