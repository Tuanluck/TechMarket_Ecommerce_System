const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Dashboard statistics
exports.getDashboardStats = async () => {
  const [totalOrders, revenueAgg, totalProducts, totalUsers, recentOrders, ordersByStatus] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } },
    ]),
    Product.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'fullName email'),
    Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]),
  ]);

  const totalRevenue = revenueAgg[0] ? revenueAgg[0].total : 0;

  const statusMap = {
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
  ordersByStatus.forEach(item => {
    statusMap[item._id] = item.count;
  });

  return {
    totalOrders,
    totalRevenue,
    totalProducts,
    totalUsers,
    recentOrders,
    ordersByStatus: statusMap,
  };
};

// User management
exports.listUsers = async ({ page = 1, limit = 20, role, q }) => {
  const filter = { role: { $ne: 'admin' } };
  if (role) filter.role = role;
  if (q) {
    const regex = new RegExp(q, 'i');
    filter.$or = [{ fullName: regex }, { email: regex }];
  }
  const skip = (page - 1) * limit;
  const users = await User.find(filter).select('-password -__v').skip(skip).limit(limit);
  const total = await User.countDocuments(filter);
  return { users, total, page, limit };
};

// Toggle user active status
exports.toggleUserActive = async (userId, requesterId) => {
  if (userId === requesterId) {
    const err = new Error('CANNOT_MODIFY_SELF');
    err.status = 400;
    throw err;
  }
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  user.isActive = !user.isActive;
  await user.save();
  return user;
};

// Admin order list
exports.listOrders = async ({ page = 1, limit = 15, status, paymentStatus, q }) => {
  const filter = {};
  if (status) filter.orderStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (q) filter.orderCode = new RegExp(q, 'i');

  const skip = (page - 1) * limit;
  const orders = await Order.find(filter)
    .populate('userId', 'fullName email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Order.countDocuments(filter);
  return { orders, total, page, limit };
};
