import path from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import morgan from 'morgan';


import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import globalErrorHandler from './middleware/errorHandler.js';
import * as orderController from './controllers/orderController.js';
import { mountRoutes } from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  orderController.webhookCheckout,
);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());

app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    ...Object.getOwnPropertyDescriptor(req, 'query'),
    value: req.query,
    writable: true,
  });
  next();
});

mountRoutes(app);

app.use(globalErrorHandler);


const swaggerDoc = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
export { app };
