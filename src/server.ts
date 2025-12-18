import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { join } from 'node:path';
import jwt from 'jsonwebtoken';
import { environment } from './environments/environment';

const app = express();
const angularApp = new AngularNodeAppEngine();

/* -------------------- STATIC -------------------- */
const browserDistFolder = join(import.meta.dirname, '../browser');

/* -------------------- SECURITY -------------------- */
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: 'http://localhost:4000',
    credentials: true,
  })
);

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json());
app.use(cookieParser());

declare module 'express-session' {
  interface SessionData {
    user?: {
      username: string;
      companyID: number | null;
      userMenu: any[];
    };
  }
}

app.use(
  session({
    name: 'SESSION_ID',
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true in HTTPS
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    },
  })
);

/* -------------------- AUTH API -------------------- */

// LOGIN
app.post('/api/login', async (req, res) => {
  console.log('LOGIN BODY:', req.body);
  console.log('API URL:', environment.apiUrl);

  const apiUrl = `${environment.apiUrl}/Authentication/Login`;
  console.log('FINAL LOGIN URL:', apiUrl);

  const apiRes = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body),
  });

  console.log('BACKEND STATUS:', apiRes.status);
  console.log('BACKEND RESPONSE:', await apiRes.clone().text());

  if (!apiRes.ok) {
    return res.status(401).json({ message: 'Invalid login' });
  }

  const data = await apiRes.json();

  // JWT cookie
  res.cookie('ACCESS_TOKEN', data.token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    expires: new Date(data.expiration),
  });

  // Session data
  req.session.user = {
    username: data.username,
    companyID: data.companyID,
    userMenu: data.userMenu,
  };

  return res.json({ success: true });
});

// CURRENT USER
app.get('/api/me', (req, res) => {
  if (req.session.user) {
    return res.json(req.session.user);
  }

  const token = req.cookies['ACCESS_TOKEN'];
  if (!token) return res.status(401).json(null);

  try {
    const decoded: any = jwt.verify(token, 'YOUR_JWT_SECRET');

    req.session.user = {
      username: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      companyID: decoded.companyID,
      userMenu: decoded.userMenu
    };

    return res.json(req.session.user);
  } catch {
    return res.status(401).json(null);
  }
});

// LOGOUT
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('SESSION_ID');
    res.clearCookie('ACCESS_TOKEN');
    res.json({ success: true });
  });
});

/* -------------------- STATIC FILES -------------------- */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
  })
);

/* -------------------- SSR HANDLER -------------------- */
app.use((req, res, next) => {
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

/* -------------------- START -------------------- */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  app.listen(4000, () => {
    console.log('✔ SSR Server running http://localhost:4000');
  });
}

export const reqHandler = createNodeRequestHandler((req, res) =>
  app(req, res)
);
