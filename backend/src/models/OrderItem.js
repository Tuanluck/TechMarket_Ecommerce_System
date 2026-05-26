const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Mã đơn hàng là bắt buộc'],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Mã sản phẩm là bắt buộc'],
    },
    variantName: {
      type: String,
      trim: true,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Số lượng sản phẩm mua là bắt buộc'],
      min: [1, 'Số lượng mua tối thiểu là 1'],
      default: 1,
    },
    priceAtBuy: {
      type: Number,
      required: [true, 'Giá sản phẩm tại thời điểm mua là bắt buộc'],
      min: [0, 'Giá sản phẩm không được âm'],
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

// Index phục vụ tìm kiếm các mặt hàng trong một đơn hàng nhanh chóng
OrderItemSchema.index({ orderId: 1 });

// Query middleware to filter out deleted order items
OrderItemSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

const OrderItem = mongoose.model('OrderItem', OrderItemSchema);

module.exports = OrderItem;
