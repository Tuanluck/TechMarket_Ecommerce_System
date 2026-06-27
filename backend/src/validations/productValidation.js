const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const variantSchema = Joi.object({
    color: Joi.string().trim().allow('').optional(),
    specs: Joi.string().trim().allow('').optional(),
    price: Joi.number().min(0).required().messages({
        'any.required': 'Giá biến thể là bắt buộc',
        'number.base': 'Giá biến thể phải là số',
        'number.min': 'Giá biến thể không được nhỏ hơn 0'
    }),
    stock: Joi.number().integer().min(0).default(0).messages({
        'number.base': 'Tồn kho biến thể phải là số',
        'number.min': 'Tồn kho biến thể không được nhỏ hơn 0'
    })
});

const createProductSchema = {
    body: Joi.object({
        name: Joi.string().trim().required().messages({
            'any.required': 'Tên sản phẩm là bắt buộc',
            'string.empty': 'Tên sản phẩm không được để trống'
        }),
        slug: Joi.string().trim().required().messages({
            'any.required': 'Slug sản phẩm là bắt buộc',
            'string.empty': 'Slug sản phẩm không được để trống'
        }),
        categoryId: Joi.string().regex(objectIdPattern).required().messages({
            'any.required': 'Mã danh mục là bắt buộc',
            'string.pattern.base': 'Mã danh mục không đúng định dạng ObjectId'
        }),
        brandId: Joi.string().regex(objectIdPattern).required().messages({
            'any.required': 'Mã thương hiệu là bắt buộc',
            'string.pattern.base': 'Mã thương hiệu không đúng định dạng ObjectId'
        }),
        thumbnail: Joi.string().trim().required().messages({
            'any.required': 'Ảnh đại diện sản phẩm là bắt buộc',
            'string.empty': 'Ảnh đại diện sản phẩm không được để trống'
        }),
        images: Joi.array().items(Joi.string().trim()).default([]),
        basePrice: Joi.number().min(0).required().messages({
            'any.required': 'Giá gốc sản phẩm là bắt buộc',
            'number.min': 'Giá gốc sản phẩm không được nhỏ hơn 0'
        }),
        stock: Joi.number().integer().min(0).default(0).messages({
            'number.min': 'Tồn kho sản phẩm không được nhỏ hơn 0'
        }),
        specs: Joi.object().pattern(Joi.string(), Joi.string().allow('')).default({}),
        variants: Joi.array().items(variantSchema).default([])
    })
};

const updateProductSchema = {
    body: Joi.object({
        name: Joi.string().trim().optional(),
        slug: Joi.string().trim().optional(),
        categoryId: Joi.string().regex(objectIdPattern).optional().messages({
            'string.pattern.base': 'Mã danh mục không đúng định dạng ObjectId'
        }),
        brandId: Joi.string().regex(objectIdPattern).optional().messages({
            'string.pattern.base': 'Mã thương hiệu không đúng định dạng ObjectId'
        }),
        thumbnail: Joi.string().trim().optional(),
        images: Joi.array().items(Joi.string().trim()).optional(),
        basePrice: Joi.number().min(0).optional().messages({
            'number.min': 'Giá gốc sản phẩm không được nhỏ hơn 0'
        }),
        stock: Joi.number().integer().min(0).optional().messages({
            'number.min': 'Tồn kho sản phẩm không được nhỏ hơn 0'
        }),
        specs: Joi.object().pattern(Joi.string(), Joi.string().allow('')).optional(),
        variants: Joi.array().items(variantSchema).optional()
    })
};

module.exports = {
    createProductSchema,
    updateProductSchema
};
