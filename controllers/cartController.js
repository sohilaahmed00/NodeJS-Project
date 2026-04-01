import Cart    from '../models/cartModel.js';
import Product from "../models/productModel.js";
import Coupon  from '../models/couponModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { APIError }     from '../utils/apiError.js';

// @desc    Add product to cart
// @route   POST /api/v1/cart
// @access  Private/User
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) return next(new APIError('No product found with that ID', 404));

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ product: productId, quantity, price: product.price }],
    });
  } else {
    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.cartItems[itemIndex].quantity += quantity;
    } else {
      cart.cartItems.push({ product: productId, quantity, price: product.price });
    }
  }

  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Product added to cart successfully',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Remove specific cart item
// @route   DELETE /api/v1/cart/:itemId
// @access  Private/User
export const removeFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { cartItems: { _id: req.params.itemId } } },
    { new: true }
  );

  if (!cart) return next(new APIError('No cart found for this user', 404));

  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Get logged user cart
// @route   GET /api/v1/cart
// @access  Private/User
export const getCurrentUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate('cartItems.product', 'title price imageCover')
    .populate('appliedCoupon', 'discount');

  if (!cart) return next(new APIError('No cart found for this user', 404));

  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Update specific cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private/User
export const updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new APIError('No cart found for this user', 404));

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );

  if (itemIndex === -1)
    return next(new APIError('No item found with that ID in the cart', 404));

  cart.cartItems[itemIndex].quantity = quantity;
  await cart.save();

  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Clear logged user cart
// @route   DELETE /api/v1/cart
// @access  Private/User
export const clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).json({ status: 'success', data: null });
});

// @desc    Apply coupon on logged user cart
// @route   PUT /api/v1/cart/applyCoupon
// @access  Private/User
export const applyCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expireAt: { $gt: Date.now() },
  });

  if (!coupon) return next(new APIError('Coupon is invalid or expired', 404));

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new APIError('No cart found for this user', 404));


  cart.appliedCoupon = coupon._id;
  await cart.save();


  const updatedCart = await Cart.findOne({ user: req.user._id })
    .populate('appliedCoupon', 'discount');

  res.status(200).json({
    status: 'success',
    numOfCartItems: updatedCart.cartItems.length,
    data: updatedCart,
  });
});