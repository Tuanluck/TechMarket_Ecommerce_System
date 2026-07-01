const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Voucher = require('../models/Voucher');
const PaymentWebhookRaw = require('../models/PaymentWebhookRaw');

const placeOrder = async (userId, orderData) => {
    const { shippingAddress, paymentMethod, voucherCode } = orderData;

    // 1. Get user cart and populate product details
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
        const error = new Error("Giỏ hàng rỗng");
        error.status = 400;
        error.code = "CART_EMPTY";
        throw error;
    }

    // Filter out items where product is soft deleted / null
    cart.items = cart.items.filter(item => item.productId);

    if (cart.items.length === 0) {
        const error = new Error("Giỏ hàng rỗng");
        error.status = 400;
        error.code = "CART_EMPTY";
        throw error;
    }

    // 2. Check stock of each item
    for (const item of cart.items) {
        if (item.productId.stock < item.quantity) {
            const error = new Error(`Sản phẩm ${item.productId.name} không đủ hàng tồn kho`);
            error.status = 400;
            error.code = "OUT_OF_STOCK";
            throw error;
        }
    }

    // 3. Calculate amounts
    const totalAmount = cart.items.reduce((sum, item) => {
        return sum + (item.productId.basePrice * item.quantity);
    }, 0);

    let voucherId = null;
    let discountAmount = 0;
    if (voucherCode) {
        const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase(), isDeleted: { $ne: true } });
        if (!voucher) {
            const error = new Error("Mã giảm giá không tồn tại");
            error.status = 400;
            throw error;
        }
        if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
            const error = new Error("Mã giảm giá đã hết lượt sử dụng");
            error.status = 400;
            throw error;
        }
        if (voucher.minOrderValue && totalAmount < voucher.minOrderValue) {
            const error = new Error(`Đơn hàng tối thiểu ${voucher.minOrderValue}đ để dùng voucher này`);
            error.status = 400;
            throw error;
        }
        if (voucher.discountType === 'percent') {
            discountAmount = (totalAmount * voucher.discountValue) / 100;
            if (voucher.maxDiscount) discountAmount = Math.min(discountAmount, voucher.maxDiscount);
        } else {
            discountAmount = voucher.discountValue;
        }
        voucherId = voucher._id;
    }
    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // 4. Generate orderCode
    const random4chars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderCode = 'TM' + Date.now() + random4chars;

    // 5. Create Order
    const order = await Order.create({
        orderCode,
        userId,
        totalAmount,
        discountAmount,
        finalAmount,
        voucherId,
        paymentMethod,
        paymentStatus: 'unpaid',
        orderStatus: 'pending',
        shippingAddress
    });

    if (voucherId) {
        await Voucher.findByIdAndUpdate(voucherId, { $inc: { usedCount: 1 } });
    }

    // 6. Create OrderItems (snapshot price!)
    const orderItems = cart.items.map(item => ({
        orderId: order._id,
        productId: item.productId._id,
        variantName: item.variantName || '',
        quantity: item.quantity,
        priceAtBuy: item.productId.basePrice
    }));
    await OrderItem.insertMany(orderItems);

    // 7. Decrement stock
    for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.productId._id, {
            $inc: { stock: -item.quantity }
        });
    }

    // 8. Clear Cart
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    return order;
};

const getOrders = async (userId, queryParams) => {
    let { page = 1, limit = 10, status } = queryParams;
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;

    const skip = (page - 1) * limit;

    const filter = { userId };
    if (status && status !== 'all') {
        filter.orderStatus = status;
    }

    const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id }).populate('productId', 'name slug thumbnail');
        return {
            ...order.toObject(),
            items
        };
    }));

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return {
        orders: ordersWithItems,
        pagination: {
            total,
            page,
            limit,
            totalPages
        }
    };
};

const getOrderById = async (id, userId, userRole) => {
    const order = await Order.findById(id);
    if (!order) {
        const error = new Error("Đơn hàng không tồn tại");
        error.status = 404;
        error.code = "ORDER_NOT_FOUND";
        throw error;
    }

    // Ownership check (trừ admin & staff)
    if (order.userId.toString() !== userId && userRole !== 'admin' && userRole !== 'staff') {
        const error = new Error("Bạn không có quyền truy cập đơn hàng này");
        error.status = 403;
        error.code = "FORBIDDEN_ACCESS";
        throw error;
    }

    const items = await OrderItem.find({ orderId: order._id }).populate('productId', 'name slug thumbnail');

    return {
        order,
        items
    };
};

const cancelOrder = async (id, userId, userRole) => {
    const order = await Order.findById(id);
    if (!order) {
        const error = new Error("Đơn hàng không tồn tại");
        error.status = 404;
        error.code = "ORDER_NOT_FOUND";
        throw error;
    }

    // Ownership check: Chỉ khách hàng sở hữu đơn hàng mới có thể hủy (hoặc admin/staff)
    if (order.userId.toString() !== userId && userRole !== 'admin' && userRole !== 'staff') {
        const error = new Error("Bạn không có quyền hủy đơn hàng này");
        error.status = 403;
        error.code = "FORBIDDEN_ACCESS";
        throw error;
    }

    // Status check
    if (order.orderStatus !== 'pending') {
        const error = new Error("Chỉ có thể hủy đơn hàng ở trạng thái pending");
        error.status = 400;
        error.code = "CANNOT_CANCEL";
        throw error;
    }

    order.orderStatus = 'cancelled';
    await order.save();

    // Revert stock
    const items = await OrderItem.find({ orderId: order._id });
    for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity }
        });
    }

    return order;
};

const updateOrderStatus = async (id, status) => {
    const order = await Order.findById(id);
    if (!order) {
        const error = new Error("Đơn hàng không tồn tại");
        error.status = 404;
        error.code = "ORDER_NOT_FOUND";
        throw error;
    }

    const oldStatus = order.orderStatus;
    if (oldStatus === status) {
        return order;
    }

    // If changing to cancelled, revert stock
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
        const items = await OrderItem.find({ orderId: order._id });
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity }
            });
        }
    }

    // If changing FROM cancelled to something else (not common but for completeness), decrement stock
    if (oldStatus === 'cancelled' && status !== 'cancelled') {
        const items = await OrderItem.find({ orderId: order._id });
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }
    }

    order.orderStatus = status;
    await order.save();

    return order;
};

const confirmVnpayPayment = async (orderCode, responseCode, queryParams) => {
    const order = await Order.findOne({ orderCode });
    if (!order) {
        const error = new Error("Đơn hàng không tồn tại");
        error.status = 404;
        error.code = "ORDER_NOT_FOUND";
        throw error;
    }

    // If order is already paid, just return it
    if (order.paymentStatus === 'paid') {
        return order;
    }

    const isSuccess = responseCode === '00';
    const transactionId = queryParams.vnp_TransactionNo || `VNP_${Date.now()}`;

    // Try to log the webhook payload
    try {
        await PaymentWebhookRaw.create({
            orderId: order._id,
            transactionId: transactionId,
            payload: queryParams,
            status: isSuccess ? 'processed' : 'failed'
        });
    } catch (dbError) {
        // If it's a duplicate transactionId, it means we already processed this webhook
        if (dbError.code === 11000) {
            console.log(`Duplicate webhook received for transaction ${transactionId}, skipping processing.`);
            return order;
        }
        console.error("Failed to log payment webhook raw payload:", dbError);
    }

    if (isSuccess) {
        order.paymentStatus = 'paid';
        order.orderStatus = 'processing';
        await order.save();
    } else {
        // Only revert stock if we are transitioning to cancelled
        if (order.orderStatus !== 'cancelled') {
            order.orderStatus = 'cancelled';
            await order.save();

            // Revert stock
            const items = await OrderItem.find({ orderId: order._id });
            for (const item of items) {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { stock: item.quantity }
                });
            }
        }
    }

    return order;
};

module.exports = {
    placeOrder,
    getOrders,
    getOrderById,
    cancelOrder,
    updateOrderStatus,
    confirmVnpayPayment
};
