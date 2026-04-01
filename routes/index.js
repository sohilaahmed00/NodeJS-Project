import { fileURLToPath } from "url";
import path from "path";
import express from "express";

import { orderRouter } from './orderRoutes.js';
import { viewsRouter } from './viewsRoutes.js';

import cartRouter from './cartRoutes.js';
import couponRouter from './couponRoutes.js';

import authRouter from './authRoutes.js';
import userRouter from './userRoutes.js';
import addressRouter from './addressRoutes.js';
import wishlistRouter from './wishlistRoutes.js';
import productRouter from "./productRoutes.js";
import categoryRouter from "./categoryRoutes.js";
import reviewsRouter from "./reviewRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mountRoutes = (app) => {
  app.use('/api/v1/orders', orderRouter);
  app.use('/api/v1/cart', cartRouter);
  app.use('/api/v1/coupons', couponRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/addresses', addressRouter);
  app.use('/api/v1/wishlist', wishlistRouter);
  app.use('/api/v1/products', productRouter);
  app.use('/api/v1/categories', categoryRouter);
  app.use('/api/v1/reviews', reviewsRouter);
  app.use('/api/v1/uploads', express.static(path.join(__dirname, "..", "uploads")));
  
  app.use('/', viewsRouter);

};

export { mountRoutes };
