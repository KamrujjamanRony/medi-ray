import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { join } from 'node:path';

const app = express();
const angularApp = new AngularNodeAppEngine();

/* ----------------------------------------------------
   STATIC BROWSER BUILD
-----------------------------------------------------*/
const browserDistFolder = join(import.meta.dirname, '../browser');

/* ----------------------------------------------------
   SECURITY HEADERS
-----------------------------------------------------*/
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

/* ----------------------------------------------------
   ALLOWED FRONTEND DOMAINS
-----------------------------------------------------*/
const allowedDomains = [
  'http://localhost:4200',
  'http://localhost:4000',
  'https://supersoftbd.com',
  'https://mec.supersoftbd.com',
];

/* ----------------------------------------------------
   CORS + DOMAIN WHITELIST
   - SSR requests (no Origin header) always allowed
-----------------------------------------------------*/
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  if (!origin) return next(); // SSR request → allowed

  if (!allowedDomains.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: unauthorized domain',
    });
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-app-origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  return next();
});

/* ----------------------------------------------------
   CLIENT IDENTIFICATION (App Key)
-----------------------------------------------------*/
// app.use((req: Request, res: Response, next: NextFunction) => {
//   const key = req.headers['x-app-origin'];
  
//   // Skip header check for SSR requests (initial page load, static assets, etc.)
//   const isSSRRequest = req.path.includes('.') || // static files
//                        req.path === '/' ||       // root route
//                        req.headers['sec-fetch-dest'] === 'image' || // images
//                        req.headers['accept']?.includes('image');    // image requests
  
//   if (isSSRRequest) {
//     console.log("SSR/Static request detected, skipping header check");
//     return next();
//   }
//   // console.log('isSSR:', isSSRRequest)          
//   // console.log("CLIENT KEY:", key);
//   // console.log("headers:", req.headers);  

//   if (!key || key !== 'supersoftbd-client') {
//     return res.status(403).json({ message: 'Forbidden: Unauthorized client' });
//   }

//   return next();
// });


/* ----------------------------------------------------
   RATE LIMITER
-----------------------------------------------------*/
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, message: 'Too many requests. Slow down.' },
});

/* ----------------------------------------------------
   API PROXY
-----------------------------------------------------*/
// app.use(
//   '/api',
//   apiRateLimiter,
//   createProxyMiddleware({
//     target: 'https://mec.supersoftbd.com/apiA',
//     changeOrigin: true,
//     pathRewrite: { '^/api': '' },
//   })
// );


/* ----------------------------
   IMAGE PROXY WITH TOKEN
---------------------------- */
// const IMAGE_BACKEND = 'https://mec.supersoftbd.com/Images';
// const BACKEND_SECRET = process.env['BACKEND_SECRET'] || 'supersoftbd-client';

// // Generate signed token
// function generateImageToken(filename: string, expiresInSec = 60): string {
//   const expires = Date.now() + expiresInSec * 1000;
//   const payload = `${filename}:${expires}`;
//   const hash = crypto.createHmac('sha256', BACKEND_SECRET).update(payload).digest('hex');
//   return `${hash}.${expires}`;
// }

// // Validate signed token
// function validateImageToken(filename: string, token: string) {
//   const [hash, expiresStr] = token.split('.');
//   const expires = parseInt(expiresStr, 10);

//   if (Date.now() > expires) return false;

//   const payload = `${filename}:${expires}`;
//   const validHash = crypto.createHmac('sha256', BACKEND_SECRET)
//     .update(payload)
//     .digest('hex');

//   return hash === validHash;
// }

// /* --------------------------------------------------
//    IMAGE SECURITY: Middleware BEFORE proxy
// -------------------------------------------------- */
// app.get('/img/:filename', (req: Request, res: Response, next: NextFunction) => {
//   const { filename } = req.params;
//   const token = req.query['token'] as string | undefined;

//   // SSR/Internal requests get a bypass
//   if (req.headers['x-ssr-secret'] === BACKEND_SECRET) {
//     return next();
//   }

//   // Validate token for browser
//   if (!token || !validateImageToken(filename, token)) {
//     return res.status(403).json({
//       message: 'Forbidden: Unauthorized access to image'
//     });
//   }

//   next();
// });

// /* --------------------------------------------------
//    PROXY IMAGE REQUEST AFTER SECURITY CHECK
// -------------------------------------------------- */
// app.use(
//   '/img',
//   createProxyMiddleware({
//     target: IMAGE_BACKEND,
//     changeOrigin: true,
//     secure: true,

//     // ⭐ Rewrite "/img/filename.jpg?token=xxx" → "/filename.jpg"
//     pathRewrite: (path: string, req: Request) => {
//       const filename = req.params['filename'] || path.replace('/img/', '').split('?')[0];
//       return `/${filename}`;
//     },

//     on: {
//       proxyReq: (proxyReq: any, req: Request) => {
//         // Add SSR secret when internal request
//         if (req.headers['x-ssr-secret'] === BACKEND_SECRET) {
//           proxyReq.setHeader('x-ssr-secret', BACKEND_SECRET);
//         }
//       },
//       error: (err: any, req: Request, res: Response) => {
//         console.error('Image proxy error:', err);
//         res.status(502).end();
//       }
//     }
//   } as any)
// );


/* ----------------------------------------------------
   SERVE STATIC FILES
-----------------------------------------------------*/
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  })
);

/* ----------------------------------------------------
   SSR REQUEST HANDLER
-----------------------------------------------------*/
app.use((req: Request, res: Response, next: NextFunction) => {
  angularApp
    .handle(req)
    .then((response) => {
      if (response) {
        writeResponseToNodeResponse(response, res);
      } else {
        next();
      }
    })
    .catch(next);
});

/* ----------------------------------------------------
   START SERVER
-----------------------------------------------------*/
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`✔ SSR Server running on http://localhost:${port}`);
  });
}

/* ----------------------------------------------------
   ANGULAR DEV-SERVER HANDLER (IMPORTANT)
-----------------------------------------------------*/
export const reqHandler = createNodeRequestHandler((req, res) => app(req, res));
