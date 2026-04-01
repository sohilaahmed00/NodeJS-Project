import { Router } from 'express';
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getMe,
  getCurrentUser,
  updateMe,
  deleteMe,
} from '../controllers/userController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = Router();

// Logged-in user routes
router.use(protect);

router.get('/me',       getMe, getCurrentUser);
router.put('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

// Admin-only routes
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers);
router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

export default router;
