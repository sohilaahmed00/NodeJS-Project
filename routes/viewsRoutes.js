import { Router } from 'express';

const router = Router();

import * as viewsController from '../controllers/viewsController.js';

router.get('/checkout-success', viewsController.checkoutSuccess);
router.get('/checkout-cancel', viewsController.checkoutCancel);

export { router as viewsRouter };
