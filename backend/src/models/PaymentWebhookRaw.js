const mongoose = require('mongoose');

const PaymentWebhookRawSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Mã đơn hàng là bắt buộc'],
    },
    transactionId: {
      type: String,
      required: [true, 'Mã giao dịch từ nhà cung cấp thanh toán là bắt buộc'],
      unique: true,
      trim: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed, // Lưu toàn bộ JSON webhook trả về từ cổng thanh toán (VNPay, MoMo)
      required: [true, 'Dữ liệu thô (payload) của webhook là bắt buộc'],
    },
    status: {
      type: String,
      enum: {
        values: ['processed', 'failed', 'ignored'],
        message: 'Trạng thái xử lý webhook không hợp lệ',
      },
      default: 'processed',
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

// Unique Index cho transactionId giúp thực hiện cơ chế chống trùng lặp (Idempotency)
PaymentWebhookRawSchema.index({ transactionId: 1 }, { unique: true });

// Query middleware to filter out deleted webhooks
PaymentWebhookRawSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

const PaymentWebhookRaw = mongoose.model('PaymentWebhookRaw', PaymentWebhookRawSchema);

module.exports = PaymentWebhookRaw;
