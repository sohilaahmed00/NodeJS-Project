import { Router } from 'express';
import {
  signup,
  login,
  verifyEmail,
} from '../controllers/authController.js';

const router = Router();

router.post('/signup',           signup);
router.post('/login',            login);
router.get('/verifyEmail/:token', verifyEmail);

export default router;
