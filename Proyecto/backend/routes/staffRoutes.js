// routes/staffRoutes.js
const express = require('express');
const router = express.Router();
const {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  payStaff
} = require('../controllers/staffController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación de admin
router.use(protect);
router.use(requireAdmin);

router.get('/', getStaff);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);
router.put('/:id/pay', payStaff);

module.exports = router;
