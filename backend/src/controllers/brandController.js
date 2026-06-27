const brandService = require('../services/brandService');

const getBrands = async (req, res) => {
    try {
        const brands = await brandService.getBrands();
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách thương hiệu thành công",
            data: brands
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

const createBrand = async (req, res) => {
    try {
        const brand = await brandService.createBrand(req.body);
        return res.status(201).json({
            success: true,
            message: "Tạo thương hiệu thành công",
            data: brand
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

const deleteBrand = async (req, res) => {
    try {
        const brand = await brandService.deleteBrand(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Xóa thương hiệu thành công",
            data: brand
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
    getBrands,
    createBrand,
    deleteBrand
};
