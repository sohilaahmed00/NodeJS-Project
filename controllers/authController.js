import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { APIError } from '../utils/apiError.js';
import { Email } from '../utils/email.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const accessToken = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    accessToken,
    data: { user },
  });
};

// ─── Controllers ────────────────────────────────────────────────────────────

// @desc    Register a new user
// @route   POST /api/v1/auth/signup
// @access  Public
export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, role } = req.body;

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role,
    verificationToken: hashedToken,
    verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  // TODO: send verification email with `verificationToken` (plain)
  const url = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
  try {
    await new Email(user, url).sendVerifyEmail();
    res.status(201).json({
      status: 'success',
      message: 'Please check your email to continue',
    });
  } catch (err) {
    console.log(err);
    await user.deleteOne();
    next(
      new APIError(
        'There was an error sending the verification email. Try again later',
        500,
      ),
    );
  }

  // createSendToken(user, 201, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new APIError('Please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new APIError('Incorrect email or password', 401));

  createSendToken(user, 200, res);
});

// @desc    Verify email address
// @route   GET /api/v1/auth/verifyEmail/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token.trim())
    .digest('hex');

  console.log(hashedToken);

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() },
  }).select('+verificationToken +verificationTokenExpires');

  if (!user) return next(new APIError('Token is invalid or has expired', 400));

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully',
  });
});

// @desc    Protect routes — authentication middleware
// @usage   router.use(protect)
export const protect = asyncHandler(async (req, res, next) => {
  // 1) Get token from Authorization header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new APIError('You are not logged in. Please log in to get access.', 401),
    );

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id).select(
    '+passwordChangedAt',
  );
  if (!currentUser)
    return next(
      new APIError('The user belonging to this token no longer exists.', 401),
    );

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new APIError('User recently changed password. Please log in again.', 401),
    );

  req.user = currentUser;
  next();
});

// @desc    Restrict access to specific roles — authorization middleware
// @usage   router.use(restrictTo('admin', 'manager'))
export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new APIError('You do not have permission to perform this action', 403),
      );
    next();
  };
