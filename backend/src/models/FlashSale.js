const mongoose = require('mongoose');

const FlashSaleProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Sản phẩm Flash Sale là bắt buộc'],
  },
  promoPrice: {
    type: Number,
    required: [true, 'Giá khuyến mãi Flash Sale là bắt buộc'],
    min: [0, 'Giá khuyến mãi không thể nhỏ hơn 0'],
  },
  soldQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Số lượng đã bán không thể âm'],
  },
  maxQuantity: {
    type: Number,
    required: [true, 'Số lượng giới hạn mở bán là bắt buộc'],
    min: [1, 'Số lượng tối thiểu là 1'],
  }
});

const FlashSaleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên chiến dịch Flash Sale là bắt buộc'],
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Thời gian bắt đầu là bắt buộc'],
    },
    endTime: {
      type: Date,
      required: [true, 'Thời gian kết thúc là bắt buộc'],
      validate: {
        validator: function (value) {
          return this.startTime < value;
        },
        message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['upcoming', 'active', 'ended'],
        message: 'Trạng thái Flash Sale không hợp lệ',
      },
      default: 'upcoming',
    },
    products: {
      type: [FlashSaleProductSchema],
      required: [true, 'Danh sách sản phẩm tham gia Flash Sale là bắt buộc'],
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

// --- Compound Index ---
// Tối ưu hóa truy vấn tìm kiếm các chiến dịch theo trạng thái và thời gian diễn ra
FlashSaleSchema.index({ status: 1, startTime: 1, endTime: 1 });

// Query middleware to filter out deleted flash sales
FlashSaleSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

const FlashSale = mongoose.model('FlashSale', FlashSaleSchema);

module.exports = FlashSale;
