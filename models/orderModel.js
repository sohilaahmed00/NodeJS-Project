import mongoose from 'mongoose';

const orderItem = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product id is required'],
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
  },
  price: {
    type: Number,
    min: 0,
    required: [true, 'Product price is required'],
  },
  quantity: {
    type: Number,
    min: 1,
    required: [true, 'Product quantity is required'],
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    items: [orderItem],
    totalPrice: {
      type: Number,
      min: 0,
      required: [true, 'totalPrice is required'],
    },
    discountAmount: { type: Number, default: 0 },
    appliedCoupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    taxPrice: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['cash', 'card'],
        message: '{VALUE} is not a valid payment method',
      },
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    shippingAddress: {
      details: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: String,
    },
  },
  { timestamps: true },
);

const Order = mongoose.model('Order', orderSchema);
export { Order };
