// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const svgCaptcha = require('svg-captcha');
const validator = require('validator');
const User = require('../models/User');

const CAPTCHA_TTL_MS = 10 * 60 * 1000; 
const CAPTCHA_MAX_ITEMS = 200;
const captchaStore = new Map();

const cleanupCaptchas = () => {
  const now = Date.now();
  for (const [id, entry] of captchaStore.entries()) {
    if (entry.expiresAt <= now) {
      captchaStore.delete(id);
    }
  }

  while (captchaStore.size > CAPTCHA_MAX_ITEMS) {
    const oldestId = captchaStore.keys().next().value;
    captchaStore.delete(oldestId);
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '1d',
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

// POST /api/auth/login
const login = async (req, res) => {
  try {
    // 1) LEER DATOS QUE VIENEN DEL FRONT
    const correo = req.body.correo || req.body.email;
    const contraseña = req.body.contraseña || req.body.password;
    const { captchaId, captchaValue } = req.body;

    if (!correo || !contraseña) {
      return res.status(400).json({ msg: 'Correo y contraseña son requeridos' });
    }

    // 2) CAPTCHA (solo si está guardado en memoria)
    if (captchaId && captchaStore.has(captchaId)) {
      const captchaEntry = captchaStore.get(captchaId);
      if (captchaEntry.expiresAt < Date.now()) {
        captchaStore.delete(captchaId);
        return res.status(400).json({ msg: 'Captcha expirado' });
      }

      if (
        !captchaValue ||
        captchaValue.toLowerCase() !== captchaEntry.text.toLowerCase()
      ) {
        return res.status(400).json({ msg: 'Captcha incorrecto' });
      }
      captchaStore.delete(captchaId);
    }

    // 3) BUSCAR USUARIO EN LA BD (aceptar correo o email)
    const user = await User.findOne({
      $or: [{ correo }, { email: correo }],
    });

    if (!user) {
      return res.status(400).json({ msg: 'Credenciales inválidas (usuario)' });
    }

    // 4) TOMAR HASH DE CONTRASEÑA (aceptar contraseña o password en el modelo)
    const hash = user.contraseña || user.password;
    if (!hash) {
      return res
        .status(500)
        .json({ msg: 'Configuración incorrecta de usuario en BD (contraseña faltante)' });
    }

    const isMatch = await bcrypt.compare(contraseña, hash);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas (contraseña)' });
    }

    // 5) GENERAR TOKEN
    const token = generateToken(user._id);

    return res.json({
      id: user._id,
      nombre: user.nombre,
      correo: user.correo || user.email,
      rol: user.rol,
      token,
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
};

// GET /api/auth/captcha
const getCaptcha = (req, res) => {
  cleanupCaptchas();
  const captcha = svgCaptcha.create({
    size: 5,
    noise: 2,
    color: true,
    background: '#ffffff',
  });

  const id = Date.now().toString() + Math.random().toString(16).slice(2);
  captchaStore.set(id, { text: captcha.text, expiresAt: Date.now() + CAPTCHA_TTL_MS });

  return res.json({ id, data: captcha.data });
};

const register = async (req, res) => {
  try {
    const {
      nombre,
      apellidos,
      edad,
      correo,
      contraseña,
      rol = 'Employee',
      direccion,
      celular
    } = req.body;

    // Validaciones básicas
    if (!nombre || !apellidos || !correo || !contraseña) {
      return res
        .status(400)
        .json({ msg: 'Nombre, apellidos, correo y contraseña son obligatorios' });
    }

    // Validar email
    const emailValidation = validateEmail(correo);
    if (!emailValidation.isValid) {
      return res.status(400).json({ msg: emailValidation.message });
    }

    // Validar fuerza de contraseña
    const passwordValidation = evaluatePasswordStrength(contraseña);
    if (passwordValidation.strength === 'débil') {
      return res.status(400).json({
        msg: 'La contraseña es demasiado débil',
        passwordStrength: passwordValidation
      });
    }

    const existing = await User.findOne({ correo });
    if (existing) {
      return res.status(400).json({ msg: 'Ya existe un usuario con ese correo' });
    }

    const hash = await bcrypt.hash(contraseña, 10);
    const user = await User.create({
      nombre,
      apellidos,
      edad,
      correo,
      direccion,
      celular,
      contraseña: hash,
      rol
    });

    return res.status(201).json({
      id: user._id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
      direccion: user.direccion,
      celular: user.celular,
      passwordStrength: passwordValidation
    });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    return res.status(500).json({ msg: 'Error del servidor al registrar usuario' });
  }
};

const logout = async (req, res) => {
  return res.json({ msg: 'Logout OK' });
};

module.exports = { login, register, logout, getCaptcha };
