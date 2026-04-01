import { Router } from 'express';

import * as orderController from '../controllers/orderController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = Router();

router.use(protect);

router.get('/', orderController.getUserOrders, orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.post('/cash', orderController.createCashOrder);
router.post('/checkout-session', orderController.createCheckoutSession);
router.post('/:id/cancel', orderController.cancelCashOrder);
router.patch(
  restrictTo('admin'),
  '/:id/status',
  orderController.updateOrderStatus,
);

export { router as orderRouter };
