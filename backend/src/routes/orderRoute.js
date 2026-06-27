const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validate');
const { createOrderSchema, updateOrderStatusSchema } = require('../validations/orderValidation');

const router = express.Router();

router.post('/', authenticate, validate(createOrderSchema), orderController.placeOrder);
router.get('/', authenticate, orderController.getOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.patch('/:id/cancel', authenticate, orderController.cancelOrder);
router.patch('/:id/status', authenticate, authorizeRoles('admin', 'staff'), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

module.exports = router;
