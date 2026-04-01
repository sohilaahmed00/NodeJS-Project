import User           from '../models/userModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { APIError }     from '../utils/apiError.js';

// @desc    Add address to logged-in user's address list
// @route   POST /api/v1/address
// @access  Private/User
export const addAddress = asyncHandler(async (req, res, next) => {
  const { details, phone, city, postalCode } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: {
        addresses: { details, phone, city, postalCode },
      },
    },
    { new: true, runValidators: true }
  );

  if (!user) return next(new APIError('No user found', 404));

  res.status(200).json({
    status:  'success',
    message: 'Address added successfully',
    data:    user.addresses,
  });
});

// @desc    Get logged-in user's address list
// @route   GET /api/v1/address
// @access  Private/User
export const getCurrentUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new APIError('No user found', 404));

  res.status(200).json({
    status:  'success',
    results: user.addresses.length,
    data:    user.addresses,
  });
});

// @desc    Update a specific address
// @route   PUT /api/v1/address/:addressId
// @access  Private/User
export const updateAddress = asyncHandler(async (req, res, next) => {
  const { details, phone, city, postalCode } = req.body;

  const user = await User.findOneAndUpdate(
    {
      _id:              req.user._id,
      'addresses._id':  req.params.addressId,
    },
    {
      $set: {
        'addresses.$.details':    details,
        'addresses.$.phone':      phone,
        'addresses.$.city':       city,
        'addresses.$.postalCode': postalCode,
      },
    },
    { new: true, runValidators: true }
  );

  if (!user)
    return next(new APIError('No address found with that ID for this user', 404));

  res.status(200).json({
    status:  'success',
    message: 'Address updated successfully',
    data:    user.addresses,
  });
});

// @desc    Remove a specific address
// @route   DELETE /api/v1/address/:addressId
// @access  Private/User
export const removeAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { addresses: { _id: req.params.addressId } } },
    { new: true }
  );

  if (!user) return next(new APIError('No user found', 404));

  res.status(200).json({
    status:  'success',
    message: 'Address removed successfully',
    data:    user.addresses,
  });
});
