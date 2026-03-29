import './config/config.js';

import mongoose from 'mongoose';
import { app } from './app.js';

import cartRouter   from './routes/cartRoutes.js';
import couponRouter from './routes/couponRoutes.js';


let server;
try {
  await mongoose.connect(
    process.env.DB_URI.replace('<db_user>', process.env.DB_USER).replace(
      '<db_password>',
      process.env.DB_PASSWORD,
    ),
  );
  console.log('DB connected!');

  const PORT = process.env.PORT || 3000;
  server = app.listen(PORT, () =>
    console.log(`Server listening on port ${PORT}!`),
  );
} catch (error) {
  console.log(error);
}


app.use('/cart',   cartRouter);
app.use('/coupons', couponRouter);