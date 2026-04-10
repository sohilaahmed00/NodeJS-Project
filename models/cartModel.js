import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Cart item must belong to a product'],
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cart must belong to a user'],
      unique: true,
    },
    cartItems: [cartItemSchema],
    appliedCoupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual: total price of all items
cartSchema.virtual('totalCartPrice').get(function () {
  return this.cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
});

// Virtual: price after applying coupon discount
cartSchema.virtual('totalPriceAfterDiscount').get(function () {
  if (!this.appliedCoupon?.discount) return undefined;
  const total = this.totalCartPrice;
  return +(total - (total * this.appliedCoupon.discount) / 100).toFixed(2);
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
