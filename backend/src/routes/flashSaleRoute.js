const express = require('express');
const flashSaleController = require('../controllers/flashSaleController');
const { authenticate } = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const router = express.Router();

// Public route to get active flash sale
router.get('/active', flashSaleController.getActiveFlashSale);

// Admin-only routes
router.use(authenticate, authorizeRoles('admin', 'staff'));
router.post('/', flashSaleController.createFlashSale);
router.get('/', flashSaleController.listFlashSales);
router.delete('/:id', flashSaleController.deleteFlashSale);

module.exports = router;
