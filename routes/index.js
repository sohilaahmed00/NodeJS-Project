import { orderRouter } from './orderRoutes.js';
import { viewsRouter } from './viewsRoutes.js';

import cartRouter from './cartRoutes.js';
import couponRouter from './couponRoutes.js';

import authRouter from './authRoutes.js';
import userRouter from './userRoutes.js';
import addressRouter from './addressRoutes.js';
import wishlistRouter from './wishlistRoutes.js';

const mountRoutes = (app) => {
  app.use('/api/v1/orders', orderRouter);
  app.use('/api/v1/cart', cartRouter);
  app.use('/api/v1/coupons', couponRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/addresses', addressRouter);
  app.use('/api/v1/wishlist', wishlistRouter);

  app.use('/', viewsRouter);
};

export { mountRoutes };
