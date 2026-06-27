const Brand = require('../models/Brand');

const getBrands = async () => {
    return await Brand.find();
};

const createBrand = async (brandData) => {
    const { name, slug, image } = brandData;
    const existing = await Brand.findOne({ slug });
    if (existing) {
        const error = new Error("Slug thương hiệu đã tồn tại");
        error.status = 400;
        error.code = "DUPLICATE_SLUG";
        throw error;
    }
    return await Brand.create({ name, slug, image });
};

const deleteBrand = async (id) => {
    const brand = await Brand.findById(id);
    if (!brand) {
        const error = new Error("Không tìm thấy thương hiệu");
        error.status = 404;
        error.code = "BRAND_NOT_FOUND";
        throw error;
    }
    brand.isDeleted = true;
    await brand.save();
    return brand;
};

module.exports = {
    getBrands,
    createBrand,
    deleteBrand
};
