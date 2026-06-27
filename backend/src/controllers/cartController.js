const cartService = require('../services/cartService');

const getCart = async (req, res) => {
    try {
        const cart = await cartService.getCart(req.user.userId);
        return res.status(200).json({
            success: true,
            message: "Lấy giỏ hàng thành công",
            data: cart
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

const addToCart = async (req, res) => {
    try {
        const cart = await cartService.addToCart(req.user.userId, req.body);
        return res.status(200).json({
            success: true,
            message: "Thêm vào giỏ hàng thành công",
            data: cart
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const cart = await cartService.updateCartItem(req.user.userId, req.params.itemId, req.body.quantity);
        return res.status(200).json({
            success: true,
            message: "Cập nhật giỏ hàng thành công",
            data: cart
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

const deleteCartItem = async (req, res) => {
    try {
        const cart = await cartService.deleteCartItem(req.user.userId, req.params.itemId);
        return res.status(200).json({
            success: true,
            message: "Xóa mặt hàng khỏi giỏ hàng thành công",
            data: cart
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

const clearCart = async (req, res) => {
    try {
        const cart = await cartService.clearCart(req.user.userId);
        return res.status(200).json({
            success: true,
            message: "Xóa giỏ hàng thành công",
            data: cart
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
    getCart,
    addToCart,
    updateCartItem,
    deleteCartItem,
    clearCart
};
