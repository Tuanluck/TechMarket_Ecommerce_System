const mongoose = require('mongoose');

const ProductVariantSchema = new mongoose.Schema({
  color: {
    type: String,
    trim: true,
  },
  specs: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Giá biến thể là bắt buộc'],
  },
  stock: {
    type: Number,
    default: 0,
  }
});

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug sản phẩm là bắt buộc'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Danh mục sản phẩm là bắt buộc'],
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: [true, 'Thương hiệu sản phẩm là bắt buộc'],
    },
    thumbnail: {
      type: String,
      required: [true, 'Ảnh đại diện sản phẩm là bắt buộc'],
    },
    images: {
      type: [String],
      default: [],
    },
    basePrice: {
      type: Number,
      required: [true, 'Giá gốc sản phẩm là bắt buộc'],
    },
    stock: {
      type: Number,
      default: 0,
    },
    specs: {
      type: Map,
      of: String,
      default: {},
    },
    variants: {
      type: [ProductVariantSchema],
      default: [],
    },
    ratingAvg: {
      type: Number,
      default: 0,
      min: [0, 'Đánh giá không thể nhỏ hơn 0'],
      max: [5, 'Đánh giá không thể lớn hơn 5'],
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
// Unique Index cho slug để tối ưu tìm kiếm theo URL SEO
ProductSchema.index({ slug: 1 }, { unique: true });

// Compound Index cho categoryId và basePrice phục vụ bộ lọc tìm kiếm theo danh mục kết hợp sắp xếp/lọc giá
ProductSchema.index({ categoryId: 1, basePrice: 1 });

// Query middleware to filter out deleted products by default (Soft Delete)
ProductSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
