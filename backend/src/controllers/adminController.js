const adminService = require('../services/adminService');

// GET /api/v1/admin/stats
exports.getStats = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ data: stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/v1/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, q } = req.query;
    const result = await adminService.listUsers({ page, limit, role, q });
    res.json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/v1/admin/users/:id/toggle-status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await adminService.toggleUserActive(req.params.id, req.user.userId);
    res.json({ data: user });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message });
  }
};

// GET /api/v1/admin/orders
exports.getAdminOrders = async (req, res) => {
  try {
    const { page = 1, limit = 15, status, paymentStatus, q } = req.query;
    const result = await adminService.listOrders({ page, limit, status, paymentStatus, q });
    res.json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
