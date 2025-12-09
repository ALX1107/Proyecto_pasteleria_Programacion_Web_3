// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/customerController');
const { customerProtect } = require('../middleware/customerAuthMiddleware');

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas
router.get('/profile', customerProtect, getProfile);
router.put('/profile', customerProtect, updateProfile);

module.exports = router;