const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Sản phẩm là bắt buộc'],
  },
  variantName: {
    type: String,
    trim: true,
    default: '',
  },
  quantity: {
    type: Number,
    required: [true, 'Số lượng là bắt buộc'],
    min: [1, 'Số lượng tối thiểu là 1'],
    default: 1,
  }
});

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mã người dùng là bắt buộc'],
      unique: true, // Mỗi user chỉ có tối đa một giỏ hàng
    },
    items: {
      type: [CartItemSchema],
      default: [],
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

// Query middleware to filter out deleted carts
CartSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
