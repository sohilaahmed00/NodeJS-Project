const express = require('express');
const {
  getAllCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');

// const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

// router.use(protect, restrictTo('admin', 'manager'));

router.route('/').get(getAllCoupons).post(createCoupon);

router.route('/:id').get(getCoupon).put(updateCoupon).delete(deleteCoupon);

module.exports = router;
