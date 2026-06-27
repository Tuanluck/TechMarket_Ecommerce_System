const express = require('express');
const brandController = require('../controllers/brandController');
const { authenticate } = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validate');
const { createBrandSchema } = require('../validations/brandValidation');

const router = express.Router();

router.get('/', brandController.getBrands);
router.post('/', authenticate, authorizeRoles('admin', 'staff'), validate(createBrandSchema), brandController.createBrand);
router.delete('/:id', authenticate, authorizeRoles('admin'), brandController.deleteBrand);

module.exports = router;
