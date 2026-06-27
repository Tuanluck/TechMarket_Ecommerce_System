const express = require('express');
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validate');
const { createCategorySchema } = require('../validations/categoryValidation');

const router = express.Router();

router.get('/', categoryController.getCategories);
router.post('/', authenticate, authorizeRoles('admin', 'staff'), validate(createCategorySchema), categoryController.createCategory);
router.delete('/:id', authenticate, authorizeRoles('admin'), categoryController.deleteCategory);

module.exports = router;
