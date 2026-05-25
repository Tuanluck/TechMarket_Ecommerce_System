const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên danh mục là bắt buộc'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug danh mục là bắt buộc'],
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

// Query middleware to filter out deleted categories by default (Soft Delete)
CategorySchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
