import Coupon from '../models/couponModel.js';
import * as handlerFactory from './handlerFactory.js';

export const getAllCoupons = handlerFactory.getAll(Coupon);
export const getCoupon    = handlerFactory.getOne(Coupon);
export const createCoupon = handlerFactory.createOne(Coupon);
export const updateCoupon = handlerFactory.updateOne(Coupon);
export const deleteCoupon = handlerFactory.deleteOne(Coupon);
