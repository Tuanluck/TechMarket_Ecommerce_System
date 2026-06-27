const Category = require('../models/Category');

const getCategories = async () => {
    return await Category.find();
};

const createCategory = async (categoryData) => {
    const { name, slug, image } = categoryData;
    const existing = await Category.findOne({ slug });
    if (existing) {
        const error = new Error("Slug danh mục đã tồn tại");
        error.status = 400;
        error.code = "DUPLICATE_SLUG";
        throw error;
    }
    return await Category.create({ name, slug, image });
};

const deleteCategory = async (id) => {
    const category = await Category.findById(id);
    if (!category) {
        const error = new Error("Không tìm thấy danh mục");
        error.status = 404;
        error.code = "CATEGORY_NOT_FOUND";
        throw error;
    }
    category.isDeleted = true;
    await category.save();
    return category;
};

module.exports = {
    getCategories,
    createCategory,
    deleteCategory
};
