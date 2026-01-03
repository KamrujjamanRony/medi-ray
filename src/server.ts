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
app.get('/uploads/:filename', async (req, res) => {
  const { filename } = req.params;
  const width = parseInt(req.query['w'] as string, 10);
  const filePath = path.join(process.cwd(), 'uploads', filename);

  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  if (isNaN(width)) return res.sendFile(filePath);

  try {
    const image = await Jimp.read(filePath);
    const mimeType = image.mime || 'image/jpeg';

    console.log(`Resizing ${filename} to width: ${width}`); // DEBUG LOG

    // Perform the resize
    image.resize({ w: width }); 

    const buffer = await image.getBuffer(mimeType as any);

    res.set({
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=604800',
      'Vary': 'Accept' // Tells browser the content varies based on request
    });
    
    res.send(buffer);
  } catch (err) {
    console.error('Processing failed:', err);
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
