import { app, BrowserWindow } from 'electron';
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
  
  app.on('ready', () => {
    console.log(`Electron is ready, creating window`);      
    const mainWindow = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true,
      },
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