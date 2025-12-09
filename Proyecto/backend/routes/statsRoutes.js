// routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const { getSalesByProduct, createSale, getSalesHistory } = require('../controllers/statsController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.get('/sales-by-product', protect, requireAdmin, getSalesByProduct);
router.post('/sales', protect, createSale);
router.get('/sales-history', protect, getSalesHistory);

module.exports = router;
