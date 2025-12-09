// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getProducts);
router.post('/', protect, requireAdmin, upload.single('imagen'), createProduct);
router.put('/:id', protect, requireAdmin, upload.single('imagen'), updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);

module.exports = router;
