import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';import path from 'path';
import fs from 'fs';
import { Jimp } from 'jimp';
// import cors from 'cors';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Backend snippet
// app.use(cors({
//   origin: ['https://mediray.supersoftbd.com', 'http://localhost:4200'], // Allow your live site and local dev
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.get('/uploads/:filename', async (req, res) => {
  const { filename } = req.params;
  const queryW = req.query['w'];
  const width = typeof queryW === 'string' ? parseInt(queryW, 10) : NaN;
  const filePath = path.join(process.cwd(), 'uploads', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  if (isNaN(width)) {
    return res.sendFile(filePath);
  }

  try {
    // read the image using Jimp
    const image = await Jimp.read(filePath);
    
    // resize the image
    image.resize({ w: width }); 

    // get the buffer of the resized image
    const buffer = await image.getBuffer('image/jpeg');

    res.set('Cache-Control', 'public, max-age=604800');
    res.type('image/jpeg').send(buffer);

  } catch (err) {
    console.error('Jimp Error:', err);
    res.sendFile(filePath);
  }
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
