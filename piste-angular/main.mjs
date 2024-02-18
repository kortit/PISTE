import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import getPort from 'get-port';
import open from 'open';

async function startServer(){
  const expressApp = express();

  const port = await getPort({ port: [61234, 61235, 61236] });
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  expressApp.use(express.static(join(__dirname, 'dist/piste/')));
  
  // always serve index.html for all routes
  expressApp.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist/piste/index.html'));
  });
  
  expressApp.listen(port, 'localhost', () => {
    console.log(`Express server started. Listening on port ${port}`);
    var localUrl = new URL(`http://localhost:${port}/index.html`).toString();
    open(localUrl); // opens the system browser
    }
  );
}

startServer();