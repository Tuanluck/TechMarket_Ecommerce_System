const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: [true, 'Mã đơn hàng là bắt buộc'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Người mua là bắt buộc'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Tổng tiền đơn hàng là bắt buộc'],
      default: 0,
      min: [0, 'Tổng tiền không được nhỏ hơn 0'],
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tiền giảm giá không được nhỏ hơn 0'],
    },
    finalAmount: {
      type: Number,
      required: [true, 'Số tiền thanh toán cuối cùng là bắt buộc'],
      default: 0,
      min: [0, 'Số tiền thanh toán không được nhỏ hơn 0'],
    },
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voucher',
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cod', 'vnpay', 'momo'],
        message: 'Phương thức thanh toán phải là cod, vnpay hoặc momo',
      },
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['unpaid', 'paid', 'refunded'],
        message: 'Trạng thái thanh toán không hợp lệ',
      },
      default: 'unpaid',
    },
    orderStatus: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        message: 'Trạng thái đơn hàng không hợp lệ',
      },
      default: 'pending',
    },
    shippingAddress: {
      fullName: { type: String, required: [true, 'Tên người nhận là bắt buộc'], trim: true },
      phone: { type: String, required: [true, 'Số điện thoại nhận hàng là bắt buộc'], trim: true },
      province: { type: String, required: [true, 'Tỉnh/Thành phố là bắt buộc'], trim: true },
      district: { type: String, required: [true, 'Quận/Huyện là bắt buộc'], trim: true },
      ward: { type: String, required: [true, 'Phường/Xã là bắt buộc'], trim: true },
      detailAddress: { type: String, required: [true, 'Địa chỉ chi tiết là bắt buộc'], trim: true },
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

// --- Indexing Strategy ---

// 1. orderCode đã có unique:true trong field definition — không khai báo lại index ở đây tránh cảnh báo duplicate

// 2. Compound Index cho userId và createdAt phục vụ truy vấn lịch sử đơn hàng của người dùng (Sắp xếp theo thời gian mới nhất)
OrderSchema.index({ userId: 1, createdAt: -1 });

// Query middleware to filter out deleted orders
OrderSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
