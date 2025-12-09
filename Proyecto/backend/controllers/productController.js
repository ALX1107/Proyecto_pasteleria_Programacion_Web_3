// controllers/productController.js
const Product = require('../models/Product');

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ stock: -1, nombre: 1 });
    res.json(products);
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ msg: 'Error al obtener productos' });
  }
};

// POST /api/products (opcional, solo admin)
const createProduct = async (req, res) => {
  try {
    const { nombre, descripcion, costo, stock, unit, margenGanancia = 30 } = req.body;

    // Calcular precio de venta con margen de ganancia
    const precioVenta = costo * (1 + margenGanancia / 100);

    // Manejar subida de imagen
    let imagenPath = '';
    if (req.file) {
      imagenPath = `/uploads/productos/${req.file.filename}`;
    }

    const product = await Product.create({
      nombre,
      descripcion,
      costo: parseFloat(costo),
      precioVenta: parseFloat(precioVenta.toFixed(2)),
      margenGanancia: parseFloat(margenGanancia),
      stock: parseInt(stock),
      unit,
      imagen: imagenPath
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('createProduct error:', err);
    res.status(500).json({ msg: 'Error al crear producto' });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product) return res.status(404).json({ msg: 'Producto no encontrado' });
    return res.json(product);
  } catch (err) {
    console.error('updateProduct error:', err);
    res.status(500).json({ msg: 'Error al actualizar producto' });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ msg: 'Producto no encontrado' });
    return res.json({ msg: 'Producto eliminado', product });
  } catch (err) {
    console.error('deleteProduct error:', err);
    res.status(500).json({ msg: 'Error al eliminar producto' });
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
