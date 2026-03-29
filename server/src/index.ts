import express from 'express';
import cors from 'cors';
import xmlParser from 'express-xml-bodyparser';
import { config } from './config/index.js';
import { connectDatabase } from './prisma/index.js';
import wechatRouter from './routes/wechat.js';
import apiRouter from './routes/api/index.js';
import { logger } from './utils/logger.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/wechat', xmlParser({
  explicitArray: false,
  ignoreAttrs: true,
}));

app.use('/api', apiRouter);

app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ code: 500, message: 'Internal server error' });
});

async function start() {
  try {
    await connectDatabase();
    app.listen(config.server.port, () => {
      logger.info(`Server running on port ${config.server.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

start();

export default app;
