const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

// Apply authentication and role checks
router.get('/stats', authenticate, authorizeRoles('admin', 'staff'), adminController.getStats);
router.get('/users', authenticate, authorizeRoles('admin'), adminController.getUsers);
router.patch('/users/:id/toggle-status', authenticate, authorizeRoles('admin'), adminController.toggleUserStatus);
router.get('/orders', authenticate, authorizeRoles('admin', 'staff'), adminController.getAdminOrders);

module.exports = router;
