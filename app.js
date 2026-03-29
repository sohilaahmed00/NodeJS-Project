import express from 'express';
import morgan from 'morgan';

import globalErrorHandler from './middleware/errorHandler.js';
import { mountRoutes } from './routes/index.js';

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

mountRoutes(app);

app.use(globalErrorHandler);

export { app };
