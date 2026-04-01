import mongoose from 'mongoose';
import Stripe from 'stripe';

import { Order } from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import { APIError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as factory from './handlerFactory.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getProductWritesOnCreate(items) {
  return items.map((item) => ({
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
  return userCart.cartItems.map((item) => {
    let price;
    if (item.priceAfterDiscount && item.priceAfterDiscount > 0) {
      price = item.priceAfterDiscount;
    } else {
      price = item.price;
    }

    return {
      product: item.product._id,
      price,
      name: item.product.name,
      quantity: item.quantity,
    };
  });
}

export const createCashOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    return next(new APIError('Please provide shipping address'));
  }

  const userCart = await Cart.findOne({ user: req.user.id })
    .populate('cartItems.product', 'name price priceAfterDiscount')
    .populate('appliedCoupon');

  if (!userCart || userCart.cartItems.length === 0) {
    return next(new APIError('User has no cart or empty cart', 400));
  }

  const orderItems = getOrderItems(userCart);

  const productWrites = getProductWritesOnCreate(userCart.cartItems);

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

export const createCheckoutSession = asyncHandler(async (req, res, next) => {
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    return next(new APIError('Please provide shipping address'));
  }

  const userCart = await Cart.findOne({ user: req.user.id })
    .populate('cartItems.product', 'name price quantity')
    .populate('appliedCoupon');

  if (!userCart || userCart.cartItems.length === 0) {
    return next(new APIError('User has no cart or empty cart', 400));
  }

  for (const item of userCart.cartItems) {
    if (!item.product || item.product.quantity < item.quantity) {
      return next(
        new APIError(
          'Some items are out of stock, please review your cart',
          400,
        ),
      );
    }
  }

  const orderItems = getOrderItems(userCart);

  const shippingPrice = 15;
  const taxPrice = 10;

  const subtotal = userCart.totalPriceAfterDiscount || userCart.totalCartPrice;
  const totalPrice = subtotal + shippingPrice + taxPrice;
  const discountAmount = userCart.totalPriceAfterDiscount
    ? userCart.totalCartPrice - userCart.totalPriceAfterDiscount
    : 0;

  const line_items = orderItems.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: 'usd',
      unit_amount: Math.round(item.price * 100),
      product_data: {
        name: item.name,
      },
    },
  }));

  line_items.push(
    ...[
      {
        price_data: {
          currency: 'usd',
          unit_amount: taxPrice * 100,
          product_data: {
            name: 'Tax Price',
          },
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          unit_amount: shippingPrice * 100,
          product_data: {
            name: 'Shipping Price',
          },
        },
        quantity: 1,
      },
    ],
  );

  const session = await mongoose.startSession();
  try {
    let stripeSession;
    await session.withTransaction(async () => {
      const [order] = await Order.create(
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
            paymentMethod: 'card',
          },
        ],
        { session },
      );

      stripeSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: req.user.email,
        client_reference_id: order._id.toString(),
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        metadata: { cartId: userCart._id.toString() },
        line_items,
        success_url: `${req.protocol}://${req.get('host')}/checkout-success`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout-cancel`,
      });
    });
    res.redirect(stripeSession.url);
  } catch (err) {
    next(new APIError(`Something went wrong: ${err.message}`, 500));
  } finally {
    session.endSession();
  }
});

const createCardOrder = async (stripeSession) => {
  const orderId = stripeSession.client_reference_id;
  const { cartId } = stripeSession.metadata;

  console.log(orderId, cartId);

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const order = await Order.findOneAndUpdate(
        { _id: orderId, status: 'pending' },
        { status: 'paid', paidAt: Date.now() },
        { session },
      );

      if (!order || order.status === 'paid') {
        throw new Error();
      }

      const productWrites = getProductWritesOnCreate(order.items);

      const bulkResult = await Product.bulkWrite(productWrites, {
        ordered: false,
        session,
      });

      if (bulkResult.modifiedCount !== order.items.length) {
        console.log('here');
        throw new Error('Stock Mismatch');
      }

      await Cart.deleteOne({ _id: cartId }, { session });
    });
  } catch (err) {
    console.log(err.message);
    if (err.message === 'Stock Mismatch') {
      console.log(orderId);
      await Order.deleteOne({ _id: orderId });

      await stripe.refunds.create({
        payment_intent: stripeSession.payment_intent,
        reason: 'requested_by_customer',
      });
    }
  } finally {
    session.endSession();
  }
};

export const webhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    await createCardOrder(event.data.object);
  }

  res.status(200).json({ received: true });
};
