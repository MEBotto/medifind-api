import express, { Request, Response, NextFunction } from 'express';
import router from './routes';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

const app = express();

// Register security middleware before application routes.
app.use(helmet());
app.use(cors());
app.use(compression());

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Do not log request bodies, query strings, passwords, or bearer tokens.
app.use((req: Request, res: Response, next: NextFunction) => {
  const started = Date.now();
  res.on('finish', () => {
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - started}ms`);
  });
  next();
});

app.use('/api', router);
app.use(errorHandler);

export default app;
