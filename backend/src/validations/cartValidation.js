const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const addToCartSchema = {
    body: Joi.object({
        productId: Joi.string().regex(objectIdPattern).required().messages({
            'any.required': 'Mã sản phẩm là bắt buộc',
            'string.pattern.base': 'Mã sản phẩm không đúng định dạng ObjectId'
        }),
        quantity: Joi.number().integer().min(1).required().messages({
            'any.required': 'Số lượng là bắt buộc',
            'number.base': 'Số lượng phải là số',
            'number.min': 'Số lượng tối thiểu là 1'
        }),
        variantName: Joi.string().trim().allow('').optional()
    })
};

const updateCartItemSchema = {
    body: Joi.object({
        quantity: Joi.number().integer().min(1).required().messages({
            'any.required': 'Số lượng là bắt buộc',
            'number.base': 'Số lượng phải là số',
            'number.min': 'Số lượng tối thiểu là 1'
        })
    })
};

module.exports = {
    addToCartSchema,
    updateCartItemSchema
};
