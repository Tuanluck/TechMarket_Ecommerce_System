const Joi = require('joi');

const createBrandSchema = {
    body: Joi.object({
        name: Joi.string().trim().required().messages({
            'any.required': 'Tên thương hiệu là bắt buộc',
            'string.empty': 'Tên thương hiệu không được để trống'
        }),
        slug: Joi.string().trim().required().messages({
            'any.required': 'Slug thương hiệu là bắt buộc',
            'string.empty': 'Slug thương hiệu không được để trống'
        }),
        image: Joi.string().trim().allow('').optional()
    })
};

module.exports = {
    createBrandSchema
};
