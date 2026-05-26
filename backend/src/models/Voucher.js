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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index cho code phục vụ tra cứu mã giảm giá nhanh chóng
VoucherSchema.index({ code: 1 }, { unique: true });

// Query middleware to filter out deleted vouchers
VoucherSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

const Voucher = mongoose.model('Voucher', VoucherSchema);

module.exports = Voucher;
