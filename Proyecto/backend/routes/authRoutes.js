// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { login, register, logout, getCaptcha } = require('../controllers/authController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/captcha', getCaptcha);

// Solo admin puede registrar usuarios
router.post('/register', protect, requireAdmin, register);

module.exports = router;
