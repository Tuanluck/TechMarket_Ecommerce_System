const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Người đánh giá là bắt buộc'],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Sản phẩm được đánh giá là bắt buộc'],
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Mã đơn hàng liên kết là bắt buộc để xác thực đã mua'],
    },
    rating: {
      type: Number,
      required: [true, 'Số sao đánh giá là bắt buộc'],
      min: [1, 'Đánh giá tối thiểu là 1 sao'],
      max: [5, 'Đánh giá tối đa là 5 sao'],
    },
    comment: {
      type: String,
      trim: true,
      default: '',
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

// Indexes tối ưu hiệu năng
ReviewSchema.index({ productId: 1, rating: -1 }); // Lấy các review của một sản phẩm, ưu tiên rating cao/thấp
ReviewSchema.index({ orderId: 1 }); // Kiểm tra xem đơn hàng đã được đánh giá chưa

// Query middleware to filter out deleted reviews
ReviewSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
