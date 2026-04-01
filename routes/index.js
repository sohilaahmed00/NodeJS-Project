// Use like the commented code
// import { categoryRouter } from './categoryRoutes.js';

import { orderRouter } from './orderRoutes.js';
import { viewsRouter } from './viewsRoutes.js';

const mountRoutes = (app) => {
  // app.use('/api/v1/categories', categoryRouter);
  app.use('/', viewsRouter);
  app.use('/orders', orderRouter);
};

export { mountRoutes };
