import mongoose from 'mongoose';

import { Order } from '../models/orderModel.js';
import { Cart } from '../models/cartModel.js';
import { Product } from '../models/productModel.js';
import { APIError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as factory from './handlerFactory.js';

function getProductWritesOnCreate(userCart) {
  return userCart.cartItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product._id, quantity: { $gte: item.quantity } },
      update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
    },
  }));
}

function getProductWritesOnCancel(orderItems) {
  return orderItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { quantity: item.quantity, sold: -item.quantity } },
    },
  }));
}

function getOrderItems(userCart) {
  return userCart.cartItems.map((item) => ({
    product: item.product._id,
    price: item.product.price,
    name: item.product.name,
    quantity: item.quantity,
  }));
}

export const createCashOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    return next(new APIError('Please provide shipping address'));
  }

  const userCart = await Cart.findOne({ user: req.user.id })
    .populate('cartItems.product', 'name price')
    .populate('appliedCoupon');

  if (!userCart || userCart.cartItems.length === 0) {
    return next(new APIError('User has no cart or empty cart', 400));
  }

  const orderItems = getOrderItems(userCart);

  const productWrites = getProductWritesOnCreate(userCart);

  const shippingPrice = 15;
  const taxPrice = 10;

  const subtotal = userCart.totalPriceAfterDiscount || userCart.totalCartPrice;
  const totalPrice = subtotal + shippingPrice + taxPrice;
  const discountAmount = userCart.totalPriceAfterDiscount
    ? userCart.totalCartPrice - userCart.totalPriceAfterDiscount
    : 0;

  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      const bulkResult = await Product.bulkWrite(productWrites, {
        ordered: false,
        session,
      });

      if (bulkResult.modifiedCount !== userCart.cartItems.length) {
        throw new APIError(
          'Some items are out of stock, please review your cart',
          400,
        );
      }

      [order] = await Order.create(
        [
          {
            user: req.user.id,
            items: orderItems,
            totalPrice,
            discountAmount,
            appliedCoupon: userCart.appliedCoupon?._id,
            shippingPrice,
            taxPrice,
            shippingAddress,
            status: 'pending',
            paymentMethod: 'cash',
          },
        ],
        { session },
      );

      await Cart.findByIdAndDelete(userCart._id, { session });
    });
    res.status(201).json({ status: 'success', data: { order } });
  } catch (err) {
    if (err.isOperational) {
      next(err);
    } else {
      next(new APIError(`Checkout failed: ${err.message}`));
    }
  } finally {
    session.endSession();
  }
});

export const getUserOrders = (req, res, next) => {
  if (req.user.role === 'user') {
    req.query.user = req.user.id;
  }

  next();
};

export const getOrders = factory.getAll(Order);
export const getOrder = factory.getOne(Order);

export const cancelCashOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findOne({ _id: id, user: req.user.id });
  if (!order) {
    return next(new APIError('User has no order with this id', 404));
  }

  if (order.paymentMethod !== 'cash') {
    return next(new APIError('Order is not cash order', 400));
  }

  if (order.status !== 'pending') {
    return next(new APIError('You can not cancel order now', 400));
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const productWrites = getProductWritesOnCancel(order.items);
      await Product.bulkWrite(productWrites, { ordered: false, session });
      order.status = 'cancelled';
      await order.save({ session });
    });

    res.status(200).json({ status: 'success', data: { order } });
  } catch (err) {
    next(new APIError('Cancelling order failed', 500));
  } finally {
    session.endSession();
  }
});

export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const updateObj = { status };
  if (status === 'paid') {
    updateObj.paidAt = Date.now();
  }
  if (status === 'delivered') {
    updateObj.deliveredAt = Date.now();
  }

  const order = await Order.findOneAndUpdate(
    { _id: req.params.id },
    updateObj,
    { returnDocument: 'after', runValidators: true },
  );

  if (!order) {
    return next(new APIError('No order found with this id', 404));
  }

  res.status(200).json({ status: 'success', data: { order } });
});
