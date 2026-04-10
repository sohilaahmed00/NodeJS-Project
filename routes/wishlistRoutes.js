import { Router } from 'express';
import {
  addProductToWishlist,
  removeProductFromWishlist,
  getCurrentUserWishlist,
} from '../controllers/wishlistController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = Router();

router.use(protect, restrictTo('user'));

router.route('/').get(getCurrentUserWishlist).post(addProductToWishlist);

router.delete('/:productId', removeProductFromWishlist);

export default router;