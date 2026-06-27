const Joi = require('joi');

const createVoucherSchema = {
  body: Joi.object({
    code: Joi.string().required().messages({ 'any.required': 'Mã voucher là bắt buộc' }),
    discountType: Joi.string().valid('percent', 'fixed').required().messages({ 'any.required': 'Loại giảm giá là bắt buộc' }),
    discountValue: Joi.number().positive().required().messages({ 'any.required': 'Giá trị giảm giá là bắt buộc' }),
    minOrderValue: Joi.number().min(0).optional(),
    maxDiscount: Joi.when('discountType', { is: 'percent', then: Joi.number().positive().optional(), otherwise: Joi.number().min(0).optional().allow(null) }),
    usageLimit: Joi.number().integer().min(1).optional().allow(null),
    status: Joi.string().valid('active', 'draft').optional(),
    expiryDate: Joi.date().optional().allow(null, ''),
    applicableCustomerGroups: Joi.array().items(Joi.string()).optional(),
    limitPerCustomer: Joi.number().integer().min(0).optional(),
    applicablePaymentMethods: Joi.array().items(Joi.string()).optional(),
    applyScope: Joi.string().valid('all', 'category', 'product').optional(),
    applicableProducts: Joi.array().items(Joi.string()).optional(),
    applicableCategories: Joi.array().items(Joi.string()).optional(),
    applyScopeChannel: Joi.string().valid('online', 'in-store', 'all').optional(),
    applicableChannels: Joi.array().items(Joi.string()).optional(),
  }),
};

const validateVoucherSchema = {
  body: Joi.object({
    code: Joi.string().required().messages({ 'any.required': 'Mã voucher là bắt buộc' }),
    orderAmount: Joi.number().positive().required().messages({ 'any.required': 'Số tiền đơn hàng là bắt buộc' }),
    paymentMethod: Joi.string().optional().allow(''),
    cartItems: Joi.array().items(Joi.object({
      productId: Joi.string().required(),
      categoryId: Joi.string().optional().allow(''),
    })).optional(),
  }),
};

module.exports = { createVoucherSchema, validateVoucherSchema };
