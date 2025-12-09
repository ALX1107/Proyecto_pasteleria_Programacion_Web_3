// controllers/customerController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const Customer = require('../models/Customer');

const generateToken = (id) => {
  return jwt.sign({ id, type: 'customer' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '7d',
  });
};

// Función para validar email
const validateEmail = (email) => {
  if (!email) return { isValid: false, message: 'El correo electrónico es obligatorio' };
  if (!validator.isEmail(email)) return { isValid: false, message: 'El correo electrónico debe contener @ y .' };
  return { isValid: true };
};

// Función para evaluar la fuerza de la contraseña
const evaluatePasswordStrength = (password) => {
  if (!password) return { strength: 'débil', score: 0, message: 'La contraseña es obligatoria' };

  let score = 0;
  let feedback = [];

  // Longitud mínima
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Debe tener al menos 8 caracteres');
  }

  // Contiene letras minúsculas
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Debe contener letras minúsculas');
  }

  // Contiene letras mayúsculas
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Debe contener letras mayúsculas');
  }

  // Contiene números
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Debe contener números');
  }

  // Contiene caracteres especiales
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Debe contener caracteres especiales');
  }

  let strength;
  if (score <= 2) {
    strength = 'débil';
  } else if (score <= 3) {
    strength = 'normal';
  } else {
    strength = 'segura';
  }

  return {
    strength,
    score,
    message: feedback.length > 0 ? feedback.join(', ') : 'Contraseña segura'
  };
};

// POST /api/customers/register
const register = async (req, res) => {
  try {
    const {
      nombre,
      apellidos,
      email,
      telefono,
      direccion,
      password,
      fechaNacimiento,
      genero
    } = req.body;

    if (!nombre || !apellidos || !email || !telefono || !direccion || !password || !fechaNacimiento || !genero) {
      return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
    }

    // Validar email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ msg: emailValidation.message });
    }

    // Validar fuerza de contraseña
    const passwordValidation = evaluatePasswordStrength(password);
    if (passwordValidation.strength === 'débil') {
      return res.status(400).json({
        msg: 'La contraseña es demasiado débil',
        passwordStrength: passwordValidation
      });
    }

    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: 'Ya existe un usuario con ese email' });
    }

    const customer = await Customer.create({
      nombre,
      apellidos,
      email,
      telefono,
      direccion,
      password,
      fechaNacimiento,
      genero
    });

    const token = generateToken(customer._id);

    return res.status(201).json({
      id: customer._id,
      nombre: customer.nombre,
      email: customer.email,
      token,
      type: 'customer'
    });
  } catch (err) {
    console.error('Error al registrar cliente:', err);
    return res.status(500).json({ msg: 'Error del servidor al registrar cliente' });
  }
};

// POST /api/customers/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Email y contraseña son requeridos' });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const isMatch = await customer.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const token = generateToken(customer._id);

    return res.json({
      id: customer._id,
      nombre: customer.nombre,
      email: customer.email,
      token,
      type: 'customer'
    });
  } catch (err) {
    console.error('Error en login de cliente:', err);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
};

// GET /api/customers/profile
const getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id).select('-password');
    if (!customer) {
      return res.status(404).json({ msg: 'Cliente no encontrado' });
    }
    return res.json(customer);
  } catch (err) {
    console.error('Error obteniendo perfil:', err);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
};

// PUT /api/customers/profile
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // No permitir actualizar password por aquí

    const customer = await Customer.findByIdAndUpdate(
      req.customer.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!customer) {
      return res.status(404).json({ msg: 'Cliente no encontrado' });
    }

    return res.json(customer);
  } catch (err) {
    console.error('Error actualizando perfil:', err);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
};

module.exports = { register, login, getProfile, updateProfile };