import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import cookieParser from 'cookie-parser';
import type { ErrorRequestHandler } from 'express';
import { runMigrations } from './db/migrate.js';
import { authRouter } from './routes/auth.js';
import { stateRouter } from './routes/state.js';
import { accountsRouter } from './routes/accounts.js';
import { goalsRouter } from './routes/goals.js';
import { subscriptionsRouter } from './routes/subscriptions.js';
import { entriesRouter } from './routes/entries.js';

const distDir = path.resolve(process.cwd(), 'dist');

async function main() {
  await runMigrations();

  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api/auth', authRouter);
  app.use('/api/state', stateRouter);
  app.use('/api/accounts', accountsRouter);
  app.use('/api/goals', goalsRouter);
  app.use('/api/subscriptions', subscriptionsRouter);
  app.use('/api/entries', entriesRouter);

  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      next();
      return;
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  };
  app.use(errorHandler);

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
