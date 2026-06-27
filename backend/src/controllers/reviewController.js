const reviewService = require('../services/reviewService');

const createReview = async (req, res) => {
  try {
    const userId = req.user.userId; // Populate from authMiddleware
    const review = await reviewService.createReview(userId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Đánh giá sản phẩm thành công',
      data: review,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const result = await reviewService.getProductReviews(productId, page, limit);
    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách đánh giá thành công',
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user; // from authMiddleware (id, role)
    await reviewService.deleteReview(id, user);
    return res.status(200).json({
      success: true,
      message: 'Xóa đánh giá thành công',
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  deleteReview,
};
