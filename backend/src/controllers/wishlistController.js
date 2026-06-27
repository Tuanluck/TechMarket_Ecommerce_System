const wishlistService = require('../services/wishlistService');

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const wishlist = await wishlistService.getWishlist(userId);
    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách yêu thích thành công',
      data: wishlist,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Mã sản phẩm (productId) là bắt buộc',
      });
    }
    const result = await wishlistService.toggleWishlist(userId, productId);
    return res.status(200).json({
      success: true,
      message: result.added ? 'Đã thêm vào danh sách yêu thích' : 'Đã xóa khỏi danh sách yêu thích',
      data: {
        ...result.wishlist.toObject(),
        added: result.added,
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
};
