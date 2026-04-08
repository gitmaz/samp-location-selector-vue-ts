import 'dotenv/config';
import cors from 'cors';
import express, { type Response } from 'express';
import fs from 'fs';
import path from 'path';
import type { HealthResponse } from '../../shared/location.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();
const PORT = Number(process.env.PORT) || 3002;

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

app.get('/api/health', (_req, res: Response<HealthResponse>) => {
  res.json({ ok: true });
});

app.use('/api', apiRoutes);

const clientDist = path.join(process.cwd(), '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res, next) => {
    if (req.method !== 'GET') return next();
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
