import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import prisma from './config/db';
import errorHandler from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'DOWN';
  try {
    // Basic connectivity check: query simple select
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'UP';
  } catch (error) {
    dbStatus = 'DOWN';
  }

  const isHealthy = dbStatus === 'UP';
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: dbStatus
  });
});

app.use((req: Request, _res: Response, next: NextFunction) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`) as any;
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

export default app;
