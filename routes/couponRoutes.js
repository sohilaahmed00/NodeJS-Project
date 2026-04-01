import { Router } from 'express';
import {
  getAllCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';

import { protect, restrictTo } from '../controllers/authController.js';

const router = Router();

router.use(protect, restrictTo('admin', 'manager'));

router.route('/').get(getAllCoupons).post(createCoupon);
router.route('/:id').get(getCoupon).put(updateCoupon).delete(deleteCoupon);

export default router;
