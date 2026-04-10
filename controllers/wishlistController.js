import User from '../models/userModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { APIError } from '../utils/apiError.js';

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist
// @access  Private/User
export const addProductToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: productId } }, // $addToSet prevents duplicates
    { returnDocument: 'after' },
  ).populate('wishlist', 'name price image');

  if (!user) return next(new APIError('No user found', 404));

  res.status(200).json({
    status: 'success',
    message: 'Product added to wishlist successfully',
    data: user.wishlist,
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Private/User
export const removeProductFromWishlist = asyncHandler(
  async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: req.params.productId } },
      { returnDocument: 'after' },
    ).populate('wishlist', 'name price image');

    if (!user) return next(new APIError('No user found', 404));

    res.status(200).json({
      status: 'success',
      message: 'Product removed from wishlist successfully',
      data: user.wishlist,
    });
  },
);

// @desc    Get logged-in user wishlist
// @route   GET /api/v1/wishlist
// @access  Private/User
export const getCurrentUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate(
    'wishlist',
    'name price image',
  );

  if (!user) return next(new APIError('No user found', 404));

  res.status(200).json({
    status: 'success',
    numOfWishlistItems: user.wishlist.length,
    data: user.wishlist,
  });
});
