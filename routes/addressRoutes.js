import { Router } from 'express';
import {
  addAddress,
  getCurrentUserAddresses,
  updateAddress,
  removeAddress,
} from '../controllers/addressController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = Router();

router.use(protect, restrictTo('user'));

router
  .route('/')
  .get(getCurrentUserAddresses)
  .post(addAddress);

router
  .route('/:addressId')
  .put(updateAddress)
  .delete(removeAddress);

export default router;
