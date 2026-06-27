const Joi = require('joi');

const createCategorySchema = {
    body: Joi.object({
        name: Joi.string().trim().required().messages({
            'any.required': 'Tên danh mục là bắt buộc',
            'string.empty': 'Tên danh mục không được để trống'
        }),
        slug: Joi.string().trim().required().messages({
            'any.required': 'Slug danh mục là bắt buộc',
            'string.empty': 'Slug danh mục không được để trống'
        }),
        image: Joi.string().trim().allow('').optional()
    })
};

module.exports = {
    createCategorySchema
};
