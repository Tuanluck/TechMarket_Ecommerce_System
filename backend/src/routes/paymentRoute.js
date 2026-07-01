const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/create-vnpay', authenticate, paymentController.createVnpayPayment);
router.get('/vnpay-return', paymentController.vnpayReturn);
router.get('/vnpay-ipn', paymentController.vnpayIpn);

module.exports = router;
