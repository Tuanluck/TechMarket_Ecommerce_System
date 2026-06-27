const categoryService = require('../services/categoryService');

const getCategories = async (req, res) => {
    try {
        const categories = await categoryService.getCategories();
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách danh mục thành công",
            data: categories
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

const createCategory = async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body);
        return res.status(201).json({
            success: true,
            message: "Tạo danh mục thành công",
            data: category
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await categoryService.deleteCategory(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Xóa danh mục thành công",
            data: category
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
    getCategories,
    createCategory,
    deleteCategory
};
