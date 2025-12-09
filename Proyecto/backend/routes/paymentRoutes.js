// routes/paymentRoutes.js
const express = require('express');
const { createPaymentIntent, confirmPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Crear intención de pago
router.post('/create-payment-intent', protect, createPaymentIntent);

// Confirmar pago
router.post('/confirm-payment', protect, confirmPayment);

module.exports = router;