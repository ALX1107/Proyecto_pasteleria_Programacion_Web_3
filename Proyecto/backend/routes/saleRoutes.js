// routes/saleRoutes.js
const express = require('express');
const router = express.Router();
const {
  createSale,
  createCustomerSale,
  getTodaySales,
  getAllSales,
  getSalesStats,
  getSalePDF
} = require('../controllers/saleController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// Crear venta (todos los usuarios autenticados)
router.post('/', protect, createSale);

// Crear venta para clientes (sin autenticación requerida)
router.post('/customer', createCustomerSale);

// Obtener ventas del día (para el usuario actual - trabajadores)
router.get('/today', protect, getTodaySales);

// Obtener todas las ventas con filtros (solo admin)
router.get('/', protect, requireAdmin, getAllSales);

// Estadísticas de ventas del día
router.get('/stats', protect, getSalesStats);

// Generar PDF de recibo (con o sin autenticación)
router.get('/:id/pdf', getSalePDF);

module.exports = router;