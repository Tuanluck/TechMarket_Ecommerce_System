const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (userId) => {
    let cart = await Cart.findOne({ userId }).populate('items.productId', 'name slug thumbnail basePrice stock variants');
    if (!cart) {
        return { items: [], subtotal: 0 };
    }

    // Filter out items whose products have been deleted or not found
    cart.items = cart.items.filter(item => item.productId);

    const subtotal = cart.items.reduce((sum, item) => {
        return sum + (item.productId.basePrice * item.quantity);
    }, 0);

    return {
        _id: cart._id,
        userId: cart.userId,
        items: cart.items,
        subtotal,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt
    };
};

const addToCart = async (userId, itemData) => {
    const { productId, quantity, variantName } = itemData;

    const product = await Product.findById(productId);
    if (!product) {
        const error = new Error("Sản phẩm không tồn tại");
        error.status = 404;
        error.code = "PRODUCT_NOT_FOUND";
        throw error;
    }

    if (product.stock < quantity) {
        const error = new Error("Sản phẩm không đủ hàng tồn kho");
        error.status = 400;
        error.code = "OUT_OF_STOCK";
        throw error;
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = await Cart.create({ userId, items: [] });
    }

    const targetVariant = variantName || '';
    const existingItem = cart.items.find(item => 
        item.productId.toString() === productId && 
        (item.variantName || '') === targetVariant
    );

    if (existingItem) {
        if (existingItem.quantity + quantity > product.stock) {
            const error = new Error("Số lượng vượt quá hàng tồn kho khả dụng");
            error.status = 400;
            error.code = "OUT_OF_STOCK";
            throw error;
        }
        existingItem.quantity += quantity;
    } else {
        cart.items.push({
            productId,
            quantity,
            variantName: targetVariant
        });
    }

    await cart.save();
    return await getCart(userId);
};

const updateCartItem = async (userId, itemId, quantity) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
        const error = new Error("Không tìm thấy giỏ hàng");
        error.status = 404;
        error.code = "CART_NOT_FOUND";
        throw error;
    }

    const item = cart.items.find(i => i._id.toString() === itemId);
    if (!item) {
        const error = new Error("Mặt hàng không tồn tại trong giỏ hàng");
        error.status = 404;
        error.code = "CART_ITEM_NOT_FOUND";
        throw error;
    }

    const product = await Product.findById(item.productId);
    if (!product) {
        const error = new Error("Sản phẩm không tồn tại");
        error.status = 404;
        error.code = "PRODUCT_NOT_FOUND";
        throw error;
    }

    if (product.stock < quantity) {
        const error = new Error("Sản phẩm không đủ hàng tồn kho");
        error.status = 400;
        error.code = "OUT_OF_STOCK";
        throw error;
    }

    item.quantity = quantity;
    await cart.save();
    return await getCart(userId);
};

const deleteCartItem = async (userId, itemId) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
        const error = new Error("Không tìm thấy giỏ hàng");
        error.status = 404;
        error.code = "CART_NOT_FOUND";
        throw error;
    }

    cart.items = cart.items.filter(i => i._id.toString() !== itemId);
    await cart.save();
    return await getCart(userId);
};

const clearCart = async (userId) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
        return { items: [], subtotal: 0 };
    }

    cart.items = [];
    await cart.save();
    return await getCart(userId);
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    deleteCartItem,
    clearCart
};
