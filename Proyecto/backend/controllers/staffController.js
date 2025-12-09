// controllers/staffController.js
const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs');
const validator = require('validator');

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

// GET /api/staff - Obtener todos los empleados
const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json(staff);
  } catch (err) {
    console.error('getStaff error:', err);
    res.status(500).json({ msg: 'Error al obtener empleados' });
  }
};

// POST /api/staff - Crear nuevo empleado
const createStaff = async (req, res) => {
  try {
    const { nombre, apellidos, correo, contraseña, edad, direccion, celular, rol, horario, sueldo } = req.body;

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

    // Verificar si ya existe un empleado con ese correo
    const existingStaff = await Staff.findOne({ correo });
    if (existingStaff) {
      return res.status(400).json({ msg: 'Ya existe un empleado con ese correo' });
    }

    const staff = await Staff.create({
      nombre,
      apellidos,
      correo,
      contraseña,
      edad: parseInt(edad),
      direccion,
      celular,
      rol: rol || 'Employee',
      horario: horario || '9:00-18:00',
      sueldo: parseFloat(sueldo) || 2500
    });

    // No devolver la contraseña
    const staffResponse = { ...staff.toObject() };
    delete staffResponse.contraseña;

    res.status(201).json(staffResponse);
  } catch (err) {
    console.error('createStaff error:', err);
    res.status(500).json({ msg: 'Error al crear empleado' });
  }
};

// PUT /api/staff/:id - Actualizar empleado
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Si se está actualizando la contraseña, hashearla
    if (updates.contraseña) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      updates.contraseña = await bcrypt.hash(updates.contraseña, salt);
    }

    const staff = await Staff.findByIdAndUpdate(id, updates, { new: true });

    if (!staff) {
      return res.status(404).json({ msg: 'Empleado no encontrado' });
    }

    // No devolver la contraseña
    const staffResponse = { ...staff.toObject() };
    delete staffResponse.contraseña;

    res.json(staffResponse);
  } catch (err) {
    console.error('updateStaff error:', err);
    res.status(500).json({ msg: 'Error al actualizar empleado' });
  }
};

// DELETE /api/staff/:id - Eliminar empleado
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByIdAndDelete(id);

    if (!staff) {
      return res.status(404).json({ msg: 'Empleado no encontrado' });
    }

    res.json({ msg: 'Empleado eliminado exitosamente', staff });
  } catch (err) {
    console.error('deleteStaff error:', err);
    res.status(500).json({ msg: 'Error al eliminar empleado' });
  }
};

// PUT /api/staff/:id/pay - Registrar pago
const payStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByIdAndUpdate(
      id,
      { ultimoPago: new Date() },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({ msg: 'Empleado no encontrado' });
    }

    res.json({ msg: 'Pago registrado exitosamente', staff });
  } catch (err) {
    console.error('payStaff error:', err);
    res.status(500).json({ msg: 'Error al registrar pago' });
  }
};

module.exports = {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  payStaff
};
