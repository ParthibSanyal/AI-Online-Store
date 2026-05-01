const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', optionalAuth, ctrl.getProducts);
router.get('/categories', ctrl.getCategories);
router.get('/:id', optionalAuth, ctrl.getProduct);
router.post('/', protect, authorize('seller', 'admin'), ctrl.createProduct);
router.put('/:id', protect, authorize('seller', 'admin'), ctrl.updateProduct);
router.delete('/:id', protect, authorize('seller', 'admin'), ctrl.deleteProduct);
router.post('/upload-images', protect, authorize('seller', 'admin'), upload.array('images', 5), ctrl.uploadImages);

module.exports = router;
