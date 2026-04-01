import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema(
  {
    details:    { type: String },
    phone:      { type: String },
    city:       { type: String },
    postalCode: { type: String },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    password: {
      type:     String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select:   false,
    },
    phone: {
      type: String,
    },
    role: {
      type:    String,
      enum:    ['user', 'admin', 'seller'],
      default: 'user',
    },
    isVerified: {
      type:    Boolean,
      default: false,
    },
    verificationToken: {
      type:   String,
      select: false,
    },
    verificationTokenExpires: {
      type:   Date,
      select: false,
    },
    active: {
      type:    Boolean,
      default: true,
      select:  false,
    },
    addresses: [addressSchema],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'Product',
      },
    ],
    passwordChangedAt: {
      type:   Date,
      select: false,
    },
    passwordResetToken: {
      type:   String,
      select: false,
    },
    passwordResetExpires: {
      type:   Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Filter out inactive users
userSchema.pre(/^find/, function () {
  this.where({ active: { $ne: false } });
});

// Instance method: compare passwords
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return bcrypt.compare(candidatePassword, userPassword);
};

// Instance method: check if password was changed after a given timestamp
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

export default User;
