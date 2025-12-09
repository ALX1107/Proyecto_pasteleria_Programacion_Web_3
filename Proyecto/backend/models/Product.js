// models/Product.js
const mongoose = require('mongoose');
const productSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, default: '' },
    costo: { type: Number, required: true }, // Costo de producción
    precioVenta: { type: Number, required: true }, // Precio con margen de ganancia
    margenGanancia: { type: Number, default: 30 }, // Porcentaje de ganancia
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, default: 'unidad' },
    imagen: { type: String, default: '' }, // URL de la imagen
    nombreImagen: { type: String, default: '' } // Nombre del archivo de imagen
  },
  { timestamps: true }
);
module.exports = mongoose.model('Product', productSchema);
