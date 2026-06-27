const productService = require('../services/productService');

const getProducts = async (req, res) => {
    try {
        const result = await productService.getProducts(req.query);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách sản phẩm thành công",
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

const getProductBySlug = async (req, res) => {
    try {
        const product = await productService.getProductBySlug(req.params.slug);
        return res.status(200).json({
            success: true,
            message: "Lấy thông tin sản phẩm thành công",
            data: product
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

const createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);
        return res.status(201).json({
            success: true,
            message: "Tạo sản phẩm thành công",
            data: product
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: "Cập nhật sản phẩm thành công",
            data: product
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await productService.deleteProduct(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Xóa sản phẩm thành công",
            data: product
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
    getProducts,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct
};
