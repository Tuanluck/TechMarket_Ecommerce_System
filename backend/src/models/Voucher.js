const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Mã giảm giá là bắt buộc'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      enum: {
        values: ['percent', 'fixed'],
        message: 'Loại giảm giá phải là percent hoặc fixed',
      },
      required: [true, 'Loại giảm giá là bắt buộc'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Giá trị giảm giá là bắt buộc'],
      min: [0, 'Giá trị giảm giá không thể âm'],
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, 'Giá trị đơn hàng tối thiểu không thể âm'],
    },
    maxDiscount: {
      type: Number,
      min: [0, 'Giá trị giảm tối đa không thể âm'],
    },
    usageLimit: {
      type: Number,
      min: [1, 'Số lượt sử dụng tối thiểu phải là 1'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, 'Số lượt đã sử dụng không thể âm'],
    },
    status: {
      type: String,
      enum: ['active', 'draft'],
      default: 'active',
    },
    expiryDate: {
      type: Date,
    },
    applicableCustomerGroups: {
      type: [String],
      default: ['all'],
    },
    limitPerCustomer: {
      type: Number,
      default: 1,
    },
    applicablePaymentMethods: {
      type: [String],
      default: ['all'],
    },
    applyScope: {
      type: String,
      enum: ['all', 'category', 'product'],
      default: 'all',
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    applyScopeChannel: {
      type: String,
      enum: ['online', 'in-store', 'all'],
      default: 'all',
    },
    applicableChannels: {
      type: [String],
      default: ['website', 'app', 'messenger'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Query middleware to filter out deleted vouchers
VoucherSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

const Voucher = mongoose.model('Voucher', VoucherSchema);

module.exports = Voucher;
