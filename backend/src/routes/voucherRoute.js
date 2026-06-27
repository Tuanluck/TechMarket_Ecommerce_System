const express = require('express');
const voucherController = require('../controllers/voucherController');
const { authenticate } = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validate');
const { createVoucherSchema, validateVoucherSchema } = require('../validations/voucherValidation');

const router = express.Router();

// Public route for listing active vouchers
router.get('/', voucherController.listVouchers);

// Public/Authenticated route for validation
router.post('/validate', authenticate, validate(validateVoucherSchema), voucherController.validateVoucher);

// Admin-only CRUD routes
router.use(authenticate, authorizeRoles('admin', 'staff'));
router.post('/', validate(createVoucherSchema), voucherController.createVoucher);
router.delete('/:id', voucherController.deleteVoucher);

module.exports = router;
