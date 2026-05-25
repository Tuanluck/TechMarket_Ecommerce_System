const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mã người dùng là bắt buộc'],
      unique: true, // Mỗi người dùng chỉ có 1 danh sách yêu thích
    },
    productIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Product',
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

// Query middleware to filter out deleted wishlists
WishlistSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

const Wishlist = mongoose.model('Wishlist', WishlistSchema);

module.exports = Wishlist;
