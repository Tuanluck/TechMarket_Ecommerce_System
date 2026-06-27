const Voucher = require('../models/Voucher');
const Order = require('../models/Order');

// Create a new voucher
exports.createVoucher = async (req, res) => {
  try {
    const { code } = req.body;
    const upperCode = code.toUpperCase();
    // Check duplicate
    const exists = await Voucher.findOne({ code: upperCode });
    if (exists) {
      return res.status(400).json({ message: 'Mã voucher đã tồn tại' });
    }
    const voucher = await Voucher.create({
      ...req.body,
      code: upperCode,
    });
    res.status(201).json({ data: voucher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// List vouchers (admin)
exports.listVouchers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const vouchers = await Voucher.find({ isDeleted: { $ne: true } })
      .skip(skip)
      .limit(+limit);
    const total = await Voucher.countDocuments({ isDeleted: { $ne: true } });
    res.json({ data: { vouchers, total, page: +page, limit: +limit } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Soft delete voucher
exports.deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    await Voucher.findByIdAndUpdate(id, { isDeleted: true });
    res.json({ message: 'Voucher deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Validate voucher during checkout
exports.validateVoucher = async (req, res) => {
  try {
    const { code, orderAmount, paymentMethod, cartItems } = req.body;
    const voucher = await Voucher.findOne({ code: code.toUpperCase(), isDeleted: { $ne: true } });
    if (!voucher) return res.status(404).json({ message: 'Mã giảm giá không tồn tại', code: 'VOUCHER_NOT_FOUND' });
    
    // Status check
    if (voucher.status === 'draft') {
      return res.status(400).json({ message: 'Mã giảm giá ở trạng thái nháp và chưa hoạt động', code: 'VOUCHER_DRAFT' });
    }

    // Expiry date check
    if (voucher.expiryDate && new Date() > new Date(voucher.expiryDate)) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết hạn sử dụng', code: 'VOUCHER_EXPIRED' });
    }

    // Total usage limit check
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng', code: 'VOUCHER_EXHAUSTED' });
    }

    // Minimum order value check
    if (voucher.minOrderValue && orderAmount < voucher.minOrderValue) {
      return res.status(400).json({ message: `Đơn hàng tối thiểu ${voucher.minOrderValue}đ để dùng voucher này`, code: 'ORDER_TOO_SMALL' });
    }

    // Payment method restriction check
    if (voucher.applicablePaymentMethods && voucher.applicablePaymentMethods.length > 0 && !voucher.applicablePaymentMethods.includes('all')) {
      if (paymentMethod && !voucher.applicablePaymentMethods.includes(paymentMethod)) {
        return res.status(400).json({ message: 'Mã giảm giá không hỗ trợ phương thức thanh toán này', code: 'PAYMENT_METHOD_INVALID' });
      }
    }

    // Customer group restriction check
    if (req.user && voucher.applicableCustomerGroups && voucher.applicableCustomerGroups.length > 0 && !voucher.applicableCustomerGroups.includes('all')) {
      const userGroups = [];
      if (req.user.createdAt) {
        const daysDiff = (new Date() - new Date(req.user.createdAt)) / (1000 * 60 * 60 * 24);
        if (daysDiff <= 30) userGroups.push('new');
      }
      if (req.user.role === 'staff' || req.user.role === 'admin') userGroups.push('gold');

      const isEligible = voucher.applicableCustomerGroups.some(group => userGroups.includes(group) || group === 'all');
      if (!isEligible) {
        return res.status(400).json({ message: 'Tài khoản của bạn không thuộc đối tượng áp dụng của mã giảm giá này', code: 'USER_GROUP_INVALID' });
      }
    }

    // Product/Category restriction check
    if (cartItems && cartItems.length > 0) {
      if (voucher.applyScope === 'product' && voucher.applicableProducts && voucher.applicableProducts.length > 0) {
        const productIds = voucher.applicableProducts.map(id => id.toString());
        const hasValidProduct = cartItems.some(item => productIds.includes(item.productId));
        if (!hasValidProduct) {
          return res.status(400).json({ message: 'Mã giảm giá không áp dụng cho sản phẩm trong giỏ hàng', code: 'PRODUCT_INVALID' });
        }
      } else if (voucher.applyScope === 'category' && voucher.applicableCategories && voucher.applicableCategories.length > 0) {
        const categoryIds = voucher.applicableCategories.map(id => id.toString());
        const hasValidCategory = cartItems.some(item => item.categoryId && categoryIds.includes(item.categoryId));
        if (!hasValidCategory) {
          return res.status(400).json({ message: 'Mã giảm giá không áp dụng cho danh mục sản phẩm trong giỏ hàng', code: 'CATEGORY_INVALID' });
        }
      }
    }

    let discountAmount = 0;
    if (voucher.discountType === 'percent') {
      discountAmount = (orderAmount * voucher.discountValue) / 100;
      if (voucher.maxDiscount) discountAmount = Math.min(discountAmount, voucher.maxDiscount);
    } else {
      discountAmount = voucher.discountValue;
    }
    const finalAmount = Math.max(0, orderAmount - discountAmount);
    res.json({ data: { voucher, discountAmount, finalAmount } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
