const orderService = require('../services/orderService');

const placeOrder = async (req, res) => {
    try {
        const order = await orderService.placeOrder(req.user.userId, req.body);
        return res.status(201).json({
            success: true,
            message: "Đặt hàng thành công",
            data: order
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

const getOrders = async (req, res) => {
    try {
        const result = await orderService.getOrders(req.user.userId, req.query);
        return res.status(200).json({
            success: true,
            message: "Lấy lịch sử đơn hàng thành công",
            data: result
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const orderDetails = await orderService.getOrderById(req.params.id, req.user.userId, req.user.role);
        return res.status(200).json({
            success: true,
            message: "Lấy chi tiết đơn hàng thành công",
            data: orderDetails
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const order = await orderService.cancelOrder(req.params.id, req.user.userId, req.user.role);
        return res.status(200).json({
            success: true,
            message: "Hủy đơn hàng thành công",
            data: order
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
        return res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái đơn hàng thành công",
            data: order
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

module.exports = {
    placeOrder,
    getOrders,
    getOrderById,
    cancelOrder,
    updateOrderStatus
};
