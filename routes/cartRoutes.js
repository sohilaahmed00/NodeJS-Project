const express = require('express');
const {
  addToCart,
  removeFromCart,
  getCurrentUserCart,
  updateCartItemQuantity,
  clearCart,
  applyCoupon,
} = require('../controllers/cartController');

// const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

// router.use(protect, restrictTo('user'));

router
  .route('/')
  .get(getCurrentUserCart)   
  .post(addToCart)           
  .delete(clearCart);        

router.put('/applyCoupon', applyCoupon); 

router
  .route('/:itemId')
  .put(updateCartItemQuantity)  
  .delete(removeFromCart);      
module.exports = router;
