import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({"origin":["https://planyourtimes.netlify.app/","http://localhost:5173"],"credentials":true})
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.use('/api', routes);

  if (env.isProd) {
    const dist = process.env.FRONTEND_DIST ?? path.resolve(__dirname, '../../frontend/dist');
    if (fs.existsSync(dist)) {
      app.use(express.static(dist));
      app.get(/^(?!\/api).*/, (_req, res) => {
        res.sendFile(path.join(dist, 'index.html'));
      });
    }
  }

  app.use((_req, res) => {
    res.status(404).json({ error: { message: 'Route not found', code: 'NOT_FOUND' } });
  });

  app.use(errorHandler);

  return app;
}
