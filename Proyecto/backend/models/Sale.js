// models/Sale.js
const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    cantidad: { type: Number, required: true },   
    precio: { type: Number, required: true }      
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    items: { type: [saleItemSchema], required: true },
    total: { type: Number, required: true },
    metodoPago: { type: String, enum: ['Efectivo', 'Tarjeta', 'Transferencia'], default: 'Efectivo' },
    cliente: {
      nombre: { type: String, required: true },
      ci: { type: String },
      telefono: { type: String },
      direccion: { type: String }
    },
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Opcional para ventas de clientes
    usuario: { type: String }, // Opcional para ventas de clientes
    fecha: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sale', saleSchema);
