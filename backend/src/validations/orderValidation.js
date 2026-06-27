const Joi = require('joi');

const createOrderSchema = {
    body: Joi.object({
        shippingAddress: Joi.object({
            fullName: Joi.string().trim().required().messages({
                'any.required': 'Họ tên người nhận là bắt buộc',
                'string.empty': 'Họ tên người nhận không được để trống'
            }),
            phone: Joi.string().trim().required().messages({
                'any.required': 'Số điện thoại là bắt buộc',
                'string.empty': 'Số điện thoại không được để trống'
            }),
            province: Joi.string().trim().required().messages({
                'any.required': 'Tỉnh/Thành phố là bắt buộc',
                'string.empty': 'Tỉnh/Thành phố không được để trống'
            }),
            district: Joi.string().trim().required().messages({
                'any.required': 'Quận/Huyện là bắt buộc',
                'string.empty': 'Quận/Huyện không được để trống'
            }),
            ward: Joi.string().trim().required().messages({
                'any.required': 'Phường/Xã là bắt buộc',
                'string.empty': 'Phường/Xã không được để trống'
            }),
            detailAddress: Joi.string().trim().required().messages({
                'any.required': 'Địa chỉ chi tiết là bắt buộc',
                'string.empty': 'Địa chỉ chi tiết không được để trống'
            })
        }).required().messages({
            'any.required': 'Địa chỉ nhận hàng là bắt buộc'
        }),
        paymentMethod: Joi.string().valid('cod', 'vnpay', 'momo').default('cod').messages({
            'any.only': 'Phương thức thanh toán phải là cod, vnpay hoặc momo'
        }),
        voucherCode: Joi.string().trim().uppercase().optional().allow('')
    })
};

const updateOrderStatusSchema = {
    body: Joi.object({
        status: Joi.string().valid('processing', 'shipped', 'delivered', 'cancelled').required().messages({
            'any.required': 'Trạng thái đơn hàng là bắt buộc',
            'any.only': 'Trạng thái đơn hàng phải là processing, shipped, delivered hoặc cancelled'
        })
    })
};

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema
};
