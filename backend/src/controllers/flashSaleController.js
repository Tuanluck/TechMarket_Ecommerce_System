const FlashSale = require('../models/FlashSale');

// Get active or upcoming flash sale
exports.getActiveFlashSale = async (req, res) => {
  try {
    const now = new Date();
    // Try to find an active flash sale
    let flashSale = await FlashSale.findOne({
      startTime: { $lte: now },
      endTime: { $gte: now },
      status: 'active',
      isDeleted: { $ne: true },
    }).populate({
      path: 'products.productId',
      select: 'name slug thumbnail basePrice stock ratingAvg',
    });

    // If no active flash sale, find the next upcoming one
    if (!flashSale) {
      flashSale = await FlashSale.findOne({
        startTime: { $gt: now },
        isDeleted: { $ne: true },
      })
        .sort({ startTime: 1 })
        .populate({
          path: 'products.productId',
          select: 'name slug thumbnail basePrice stock ratingAvg',
        });
    }

    return res.status(200).json({
      success: true,
      data: flashSale,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin CRUD for Flash Sales
exports.createFlashSale = async (req, res) => {
  try {
    const { name, startTime, endTime, status, products } = req.body;
    const flashSale = await FlashSale.create({
      name,
      startTime,
      endTime,
      status: status || 'upcoming',
      products,
    });
    return res.status(201).json({
      success: true,
      data: flashSale,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.listFlashSales = async (req, res) => {
  try {
    const flashSales = await FlashSale.find({ isDeleted: { $ne: true } })
      .populate('products.productId', 'name slug basePrice')
      .sort({ startTime: -1 });
    return res.status(200).json({
      success: true,
      data: flashSales,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    await FlashSale.findByIdAndUpdate(id, { isDeleted: true });
    return res.status(200).json({
      success: true,
      message: 'Xóa chương trình Flash Sale thành công',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
