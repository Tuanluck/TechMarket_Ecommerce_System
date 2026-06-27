const Joi = require('joi');

const createReviewSchema = {
  body: Joi.object({
    productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      'any.required': 'Sản phẩm là bắt buộc',
      'string.pattern.base': 'Mã sản phẩm không hợp lệ',
    }),
    orderId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      'any.required': 'Mã đơn hàng là bắt buộc',
      'string.pattern.base': 'Mã đơn hàng không hợp lệ',
    }),
    rating: Joi.number().min(1).max(5).required().messages({
      'any.required': 'Đánh giá số sao là bắt buộc',
      'number.min': 'Đánh giá tối thiểu là 1 sao',
      'number.max': 'Đánh giá tối đa là 5 sao',
    }),
    comment: Joi.string().allow('').optional(),
  }),
};

module.exports = { createReviewSchema };
