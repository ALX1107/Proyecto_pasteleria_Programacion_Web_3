// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { generateSalesReportPDF } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/sales', protect, generateSalesReportPDF);

module.exports = router;
