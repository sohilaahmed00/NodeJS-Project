import User           from '../models/userModel.js';
import * as handlerFactory from './handlerFactory.js';
import { asyncHandler }    from '../utils/asyncHandler.js';
import { APIError }        from '../utils/apiError.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

// ─── "Me" helpers (set req.params.id to logged-in user's id) ────────────────

export const getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

// ─── Current-user controllers ────────────────────────────────────────────────

// @desc    Get logged-in user profile
// @route   GET /api/v1/users/me
// @access  Private/User
export const getCurrentUser = handlerFactory.getOne(User);

// @desc    Update logged-in user data (name, email, phone — NOT password)
// @route   PUT /api/v1/users/updateMe
// @access  Private/User
export const updateMe = asyncHandler(async (req, res, next) => {
  // 1) Error if user tries to update password via this route
  if (req.body.password)
    return next(
      new APIError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );

  // 2) Filter out fields that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email', 'phone');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new:          true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data:   { user: updatedUser },
  });
});

// @desc    Deactivate logged-in user (soft delete)
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/User
export const deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: 'success', data: null });
});

// ─── Admin controllers (via handlerFactory) ──────────────────────────────────

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
export const getAllUsers = handlerFactory.getAll(User);

// @desc    Get a single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
export const getUser = handlerFactory.getOne(User);

// @desc    Update a user (Admin — do NOT use for password updates)
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
export const updateUser = handlerFactory.updateOne(User);

// @desc    Delete a user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = handlerFactory.deleteOne(User);
