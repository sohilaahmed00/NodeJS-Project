const Coupon = require('../models/couponModel');
const handlerFactory = require('./handlerFactory');

exports.getAllCoupons = handlerFactory.getAll(Coupon);

exports.getCoupon = handlerFactory.getOne(Coupon);

exports.createCoupon = handlerFactory.createOne(Coupon);

exports.updateCoupon = handlerFactory.updateOne(Coupon);

exports.deleteCoupon = handlerFactory.deleteOne(Coupon);
