// middleware/customerAuthMiddleware.js
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const customerProtect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'No autorizado: Token requerido' });
    }
    const token = auth.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'customer') {
      return res.status(401).json({ msg: 'Token inválido para cliente' });
    }

    const customer = await Customer.findById(decoded.id).select('-password');
    if (!customer) {
      return res.status(401).json({ msg: 'Cliente no encontrado' });
    }

    req.customer = customer;
    next();
  } catch (err) {
    console.error('Error en customerProtect:', err.message);
    return res.status(401).json({ msg: 'Token inválido o expirado' });
  }
};

module.exports = { customerProtect };