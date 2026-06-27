const express = require('express');
const productController = require('../controllers/productController');
const { authenticate } = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validate');
const { createProductSchema, updateProductSchema } = require('../validations/productValidation');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:slug', productController.getProductBySlug);
router.post('/', authenticate, authorizeRoles('admin', 'staff'), validate(createProductSchema), productController.createProduct);
router.put('/:id', authenticate, authorizeRoles('admin', 'staff'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', authenticate, authorizeRoles('admin'), productController.deleteProduct);

module.exports = router;
