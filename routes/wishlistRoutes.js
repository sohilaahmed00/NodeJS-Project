import { Router } from 'express';
import {
  addProductToWhishlist,
  removeProductFromWhishlist,
  getCurrentUserWhishlist,
} from '../controllers/whishlistController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = Router();

router.use(protect, restrictTo('user'));

router
  .route('/')
  .get(getCurrentUserWhishlist)
  .post(addProductToWhishlist);

router.delete('/:productId', removeProductFromWhishlist);

export default router;
