const Review = require('../models/Review');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

const updateProductRating = async (productId) => {
  const reviews = await Review.find({ productId, isDeleted: { $ne: true } });
  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, { ratingAvg: 0 });
    return;
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = Math.round((sum / reviews.length) * 10) / 10;
  await Product.findByIdAndUpdate(productId, { ratingAvg: avg });
};

exports.createReview = async (userId, data) => {
  const { productId, orderId, rating, comment } = data;

  // 1. Check if order exists, belongs to user and is delivered
  const order = await Order.findOne({ _id: orderId, userId, orderStatus: 'delivered' });
  if (!order) {
    const error = new Error('Đơn hàng không tồn tại, chưa được giao thành công hoặc không thuộc về bạn');
    error.status = 400;
    throw error;
  }

  // 2. Check if product is in that order
  const orderItem = await OrderItem.findOne({ orderId, productId });
  if (!orderItem) {
    const error = new Error('Sản phẩm này không nằm trong đơn hàng đã mua');
    error.status = 400;
    throw error;
  }

  // 3. Check if already reviewed for this order
  const existing = await Review.findOne({ orderId, productId, isDeleted: { $ne: true } });
  if (existing) {
    const error = new Error('Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi');
    error.status = 400;
    throw error;
  }

  // 4. Create review
  const review = await Review.create({
    userId,
    productId,
    orderId,
    rating,
    comment,
  });

  // 5. Update rating avg
  await updateProductRating(productId);

  return review;
};

exports.getProductReviews = async (productId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const reviews = await Review.find({ productId, isDeleted: { $ne: true } })
    .populate('userId', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(+limit);

  const total = await Review.countDocuments({ productId, isDeleted: { $ne: true } });
  return { reviews, total, page: +page, limit: +limit };
};

exports.deleteReview = async (reviewId, user) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const error = new Error('Đánh giá không tồn tại');
    error.status = 404;
    throw error;
  }

  // Only admin/staff or the user who wrote the review can delete it
  if (user.role !== 'admin' && user.role !== 'staff' && review.userId.toString() !== user.userId.toString()) {
    const error = new Error('Bạn không có quyền xóa đánh giá này');
    error.status = 403;
    throw error;
  }

  review.isDeleted = true;
  await review.save();

  // Recalculate product rating
  await updateProductRating(review.productId);
  return review;
};
