const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// Helper: calculate total cart price
const calcTotalCartPrice = (cart) => {
  let total = 0;
  cart.cartItems.forEach((item) => {
    total += item.price * item.quantity;
  });
  cart.totalCartPrice = total;
  cart.totalPriceAfterDiscount = undefined;
  return total;
};

// @desc    Add product to cart
// @route   POST /api/v1/cart
// @access  Private/User
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) return next(new AppError('No product found with that ID', 404));

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // Create a new cart for the user
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ product: productId, quantity, price: product.price }],
    });
  } else {
    // Check if product already exists in cart
    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Product exists — update quantity
      cart.cartItems[itemIndex].quantity += quantity;
    } else {
      // Product doesn't exist — push new item
      cart.cartItems.push({ product: productId, quantity, price: product.price });
    }
  }

  calcTotalCartPrice(cart);
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
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { cartItems: { _id: req.params.itemId } } },
    { new: true }
  );

  if (!cart) return next(new AppError('No cart found for this user', 404));

  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Get logged user cart
// @route   GET /api/v1/cart
// @access  Private/User
exports.getCurrentUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    'cartItems.product',
    'title price imageCover'
  );

  if (!cart) return next(new AppError('No cart found for this user', 404));

  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Update specific cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private/User
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError('No cart found for this user', 404));

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );

  if (itemIndex === -1)
    return next(new AppError('No item found with that ID in the cart', 404));

  cart.cartItems[itemIndex].quantity = quantity;

  calcTotalCartPrice(cart);
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
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).json({ status: 'success', data: null });
});

// @desc    Apply coupon on logged user cart
// @route   PUT /api/v1/cart/applyCoupon
// @access  Private/User
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expireAt: { $gt: Date.now() },
  });

  if (!coupon) return next(new AppError('Coupon is invalid or expired', 404));

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError('No cart found for this user', 404));

  const totalPrice = cart.totalCartPrice;
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  cart.appliedCoupon = coupon._id;
  await cart.save();

  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
