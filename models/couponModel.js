const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Coupon name is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    expireAt: {
      type: Date,
      required: [true, 'Coupon expiration date is required'],
    },
    discount: {
      type: Number,
      required: [true, 'Coupon discount value is required'],
      min: [1, 'Discount must be at least 1'],
      max: [100, 'Discount cannot exceed 100'],
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
