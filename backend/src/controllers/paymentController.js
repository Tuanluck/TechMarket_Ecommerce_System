const vnpayService = require('../services/vnpayService');
const orderService = require('../services/orderService');
const Order = require('../models/Order');

const createVnpayPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user.userId;

        // Retrieve order details
        const orderDetails = await orderService.getOrderById(orderId, userId, req.user.role);
        const order = orderDetails.order;

        if (order.paymentMethod !== 'vnpay') {
            return res.status(400).json({
                success: false,
                message: "Đơn hàng này không sử dụng phương thức thanh toán VNPay"
            });
        }

        // Get IP Address
        const ipAddr = req.headers['x-forwarded-for'] || 
                       req.connection.remoteAddress || 
                       req.socket.remoteAddress || 
                       req.connection.socket.remoteAddress || 
                       '127.0.0.1';

        const paymentUrl = vnpayService.createPaymentUrl(order, ipAddr);

        return res.status(200).json({
            success: true,
            message: "Tạo URL thanh toán thành công",
            data: { paymentUrl }
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

const vnpayReturn = async (req, res) => {
    try {
        const result = vnpayService.verifyReturnUrl(req.query);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        if (!result.isValid) {
            return res.redirect(`${frontendUrl}/vnpay-return?status=invalid_signature`);
        }

        const order = await Order.findOne({ orderCode: result.orderCode });
        if (!order) {
            return res.redirect(`${frontendUrl}/vnpay-return?status=order_not_found`);
        }

        // Confirm the payment
        await orderService.confirmVnpayPayment(result.orderCode, result.responseCode, req.query);

        if (result.responseCode === '00') {
            return res.redirect(`${frontendUrl}/vnpay-return?status=success&orderId=${order._id}&code=${result.orderCode}`);
        } else {
            return res.redirect(`${frontendUrl}/vnpay-return?status=fail&orderId=${order._id}&code=${result.orderCode}`);
        }
    } catch (error) {
        console.error("Error in vnpayReturn controller:", error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/vnpay-return?status=error&message=${encodeURIComponent(error.message)}`);
    }
};

const vnpayIpn = async (req, res) => {
    try {
        const result = vnpayService.verifyReturnUrl(req.query);

        if (!result.isValid) {
            return res.status(200).json({ RspCode: '97', Message: 'Invalid checksum' });
        }

        const order = await Order.findOne({ orderCode: result.orderCode });
        if (!order) {
            return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }

        // Check if amount matches (multiply by 100 as VNPay passes amount * 100)
        const checkAmount = order.finalAmount * 100;
        if (parseFloat(req.query.vnp_Amount) !== checkAmount) {
            return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
        }

        // Check if order is already paid or confirmed
        if (order.paymentStatus === 'paid') {
            return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
        }

        // Confirm payment in DB
        await orderService.confirmVnpayPayment(result.orderCode, result.responseCode, req.query);

        return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    } catch (error) {
        console.error("Error in vnpayIpn controller:", error);
        return res.status(200).json({ RspCode: '99', Message: 'Internal Error' });
    }
};

module.exports = {
    createVnpayPayment,
    vnpayReturn,
    vnpayIpn
};
