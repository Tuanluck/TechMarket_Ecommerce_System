const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên thương hiệu là bắt buộc'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug thương hiệu là bắt buộc'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
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

// Query middleware to filter out deleted brands by default (Soft Delete)
BrandSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

const Brand = mongoose.model('Brand', BrandSchema);

module.exports = Brand;
