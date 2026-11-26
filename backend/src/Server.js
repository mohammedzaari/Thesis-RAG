import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { apiRouter, userRepository, documentRepository, documentService } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { SeedService } from './SeedService.js';

/** Owns the Express application lifecycle: configuration, startup, wiring. */
export class Server {
  constructor() {
    this.app = express();
    this.config();
    this.routes();
  }

  config() {
    this.app.disable('x-powered-by');
    this.app.use(helmet());
    this.app.use(cors({ origin: env.clientUrl, credentials: true }));
    this.app.use(express.json({ limit: '100kb' }));
    this.app.use(cookieParser());
  }

  routes() {
    this.app.use('/api', apiRouter);
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  async start() {
    await connectDatabase();
    if (env.seedOnStart) {
      await new SeedService(userRepository, documentRepository, documentService).run();
    }
    this.app.listen(env.port, () => console.info(`[http] API listening on port ${env.port}`));
  }
}
