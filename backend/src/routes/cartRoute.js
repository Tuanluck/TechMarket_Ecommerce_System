const express = require('express');
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { addToCartSchema, updateCartItemSchema } = require('../validations/cartValidation');

const router = express.Router();

router.get('/', authenticate, cartController.getCart);
router.post('/items', authenticate, validate(addToCartSchema), cartController.addToCart);
router.patch('/items/:itemId', authenticate, validate(updateCartItemSchema), cartController.updateCartItem);
router.delete('/items/:itemId', authenticate, cartController.deleteCartItem);
router.delete('/', authenticate, cartController.clearCart);

module.exports = router;
