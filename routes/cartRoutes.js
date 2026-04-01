import { Router } from 'express';
import {
  addToCart,
  removeFromCart,
  getCurrentUserCart,
  updateCartItemQuantity,
  clearCart,
  applyCoupon,
} from '../controllers/cartController.js';

// import { protect, restrictTo } from '../controllers/authController.js';

const router = Router();

// router.use(protect, restrictTo('user'));

router.route('/').get(getCurrentUserCart).post(addToCart).delete(clearCart);

router.patch('/applyCoupon', applyCoupon);

router.route('/:itemId').patch(updateCartItemQuantity).delete(removeFromCart);

export default router;
