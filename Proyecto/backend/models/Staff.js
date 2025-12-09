// models/Staff.js
const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    apellidos: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
    edad: { type: Number, required: true },
    rol: { type: String, enum: ['Admin', 'Employee'], default: 'Employee' },
    horario: { type: String, default: '9:00-18:00' },
    contacto: { type: String },
    sueldo: { type: Number, default: 2500 },
    ultimoPago: { type: Date },
    activo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Hash de contraseña antes de guardar
staffSchema.pre('save', async function () {
  if (!this.isModified('contraseña')) return;
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  this.contraseña = await bcrypt.hash(this.contraseña, salt);
});

// Método para comparar contraseñas
staffSchema.methods.matchPassword = async function (enteredPassword) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(enteredPassword, this.contraseña);
};

module.exports = mongoose.model('Staff', staffSchema);
