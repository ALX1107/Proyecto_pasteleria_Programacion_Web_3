// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    apellidos: { type: String, required: true },
    edad: { type: Number, required: true },
    correo: { type: String, required: true, unique: true },
    direccion: { type: String, required: true },
    celular: { type: String, required: true },
    contraseña: { type: String, required: true },
    rol: { type: String, enum: ['Admin', 'Employee'], default: 'Employee' },
  },
  { timestamps: true }
);

// Hash antes de guardar
userSchema.pre('save', async function () {
  if (!this.isModified('contraseña')) return;
  const salt = await bcrypt.genSalt(10);
  this.contraseña = await bcrypt.hash(this.contraseña, salt);
});

// Método de comparación
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.contraseña);
};

module.exports = mongoose.model('User', userSchema);
