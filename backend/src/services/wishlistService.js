const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

exports.getWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ userId }).populate('productIds');
  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, productIds: [] });
  }
  return wishlist;
};

exports.toggleWishlist = async (userId, productId) => {
  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Sản phẩm không tồn tại');
    error.status = 404;
    throw error;
  }

  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, productIds: [] });
  }

  const index = wishlist.productIds.indexOf(productId);
  let added = false;
  if (index === -1) {
    wishlist.productIds.push(productId);
    added = true;
  } else {
    wishlist.productIds.splice(index, 1);
  }

  await wishlist.save();
  return { wishlist, added };
};
