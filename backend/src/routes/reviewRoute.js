const express = require('express');
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createReviewSchema } = require('../validations/reviewValidation');

const router = express.Router();

router.post('/', authenticate, validate(createReviewSchema), reviewController.createReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
