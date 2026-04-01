// Use like the commented code
// import { categoryRouter } from './categoryRoutes.js';

import cartRouter      from './cartRoutes.js';
import couponRouter    from './couponRoutes.js';

const mountRoutes = (app) => {
  // app.use('/api/v1/categories', categoryRouter);
  
  app.use('/api/v1/cart',     cartRouter);
  app.use('/api/v1/coupons',  couponRouter);
};

export { mountRoutes };
