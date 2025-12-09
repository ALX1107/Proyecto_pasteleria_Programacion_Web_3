// controllers/saleController.js
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Crear una venta (para empleados)
const createSale = async (req, res) => {
  try {
    const { items, metodoPago, cliente } = req.body;
    const usuarioId = req.user._id;
    const usuario = req.user.nombre;

    if (!items || items.length === 0) {
      return res.status(400).json({ msg: 'Debe incluir al menos un producto' });
    }

    if (!cliente || !cliente.nombre) {
      return res.status(400).json({ msg: 'Los datos del cliente son obligatorios' });
    }

    let total = 0;
    const saleItems = [];

    // Validar stock y calcular total
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ msg: `Producto ${item.nombre} no encontrado` });
      }

      if (product.stock < item.cantidad) {
        return res.status(400).json({
          msg: `Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}`
        });
      }

      const precio = product.costo;
      const subtotal = precio * item.cantidad;
      total += subtotal;

      saleItems.push({
        nombre: product.nombre,
        cantidad: item.cantidad,
        precio: precio
      });

      // Reducir stock
      product.stock -= item.cantidad;
      await product.save();
    }

    // Crear la venta
    const sale = await Sale.create({
      items: saleItems,
      total,
      metodoPago: metodoPago || 'Efectivo',
      cliente,
      usuarioId,
      usuario,
      fecha: new Date()
    });

    res.status(201).json({
      msg: 'Venta realizada exitosamente',
      sale
    });

  } catch (err) {
    console.error('createSale error:', err);
    res.status(500).json({ msg: 'Error al procesar la venta' });
  }
};

// Crear una venta para clientes (sin requerir autenticación de empleado)
const createCustomerSale = async (req, res) => {
  try {
    const { items, metodoPago, cliente } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ msg: 'Debe incluir al menos un producto' });
    }

    if (!cliente || !cliente.nombre) {
      return res.status(400).json({ msg: 'Los datos del cliente son obligatorios' });
    }

    let total = 0;
    const saleItems = [];

    // Validar stock y calcular total
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ msg: `Producto ${item.nombre} no encontrado` });
      }

      if (product.stock < item.cantidad) {
        return res.status(400).json({
          msg: `Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}`
        });
      }

      const precio = product.costo;
      const subtotal = precio * item.cantidad;
      total += subtotal;

      saleItems.push({
        nombre: product.nombre,
        cantidad: item.cantidad,
        precio: precio
      });

      // Reducir stock
      product.stock -= item.cantidad;
      await product.save();
    }

    // Crear la venta (sin usuario asignado, ya que es compra de cliente)
    const sale = await Sale.create({
      items: saleItems,
      total,
      metodoPago: metodoPago || 'Efectivo',
      cliente,
      usuarioId: null, // No hay usuario empleado asignado
      usuario: 'Cliente Online', // Usuario genérico
      fecha: new Date()
    });

    res.status(201).json({
      msg: 'Compra realizada exitosamente',
      sale
    });

  } catch (err) {
    console.error('createCustomerSale error:', err);
    res.status(500).json({ msg: 'Error al procesar la compra' });
  }
};

// Obtener ventas del día para el usuario actual (trabajador)
const getTodaySales = async (req, res) => {
  try {
    const usuarioId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sales = await Sale.find({
      usuarioId,
      fecha: { $gte: today, $lt: tomorrow }
    }).sort({ fecha: -1 });

    res.json(sales);
  } catch (err) {
    console.error('getTodaySales error:', err);
    res.status(500).json({ msg: 'Error al obtener ventas del día' });
  }
};

// Obtener todas las ventas (admin) con filtros
const getAllSales = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta, usuario, metodoPago } = req.query;

    let filter = {};

    if (fechaDesde || fechaHasta) {
      filter.fecha = {};
      if (fechaDesde) filter.fecha.$gte = new Date(fechaDesde);
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        filter.fecha.$lte = hasta;
      }
    }

    if (usuario) filter.usuario = new RegExp(usuario, 'i');
    if (metodoPago) filter.metodoPago = metodoPago;

    const sales = await Sale.find(filter)
      .populate('usuarioId', 'nombre correo')
      .sort({ fecha: -1 });

    res.json(sales);
  } catch (err) {
    console.error('getAllSales error:', err);
    res.status(500).json({ msg: 'Error al obtener ventas' });
  }
};

// Obtener estadísticas de ventas
const getSalesStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = await Sale.find({ fecha: { $gte: today } });
    const totalVentas = todaySales.length;
    const totalIngresos = todaySales.reduce((sum, sale) => sum + sale.total, 0);

    res.json({
      totalVentas,
      totalIngresos,
      ventas: todaySales
    });
  } catch (err) {
    console.error('getSalesStats error:', err);
    res.status(500).json({ msg: 'Error al obtener estadísticas' });
  }
};

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generar PDF de recibo
const getSalePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findById(id).populate('usuarioId', 'nombre');

    if (!sale) {
      return res.status(404).json({ msg: 'Venta no encontrada' });
    }

    // Crear documento PDF
    const doc = new PDFDocument();
    const fileName = `recibo_${sale._id}.pdf`;
    const filePath = path.join(__dirname, '../uploads', fileName);

    // Pipe to file
    doc.pipe(fs.createWriteStream(filePath));
    doc.pipe(res);

    // Contenido del PDF
    doc.fontSize(20).text('RECIBO DE COMPRA', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Fecha: ${new Date(sale.fecha).toLocaleDateString()}`);
    doc.text(`ID Venta: ${sale._id}`);
    doc.text(`Cliente: ${sale.cliente.nombre}`);
    if (sale.cliente.ci) doc.text(`CI/NIT: ${sale.cliente.ci}`);
    if (sale.cliente.telefono) doc.text(`Teléfono: ${sale.cliente.telefono}`);
    if (sale.cliente.direccion) doc.text(`Dirección: ${sale.cliente.direccion}`);
    doc.text(`Método de Pago: ${sale.metodoPago}`);
    doc.text(`Usuario: ${sale.usuario}`);
    doc.moveDown();

    doc.text('Productos:', { underline: true });
    sale.items.forEach(item => {
      doc.text(`${item.nombre} x ${item.cantidad} = $${(item.precio * item.cantidad).toFixed(2)}`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total: $${sale.total.toFixed(2)}`, { align: 'right' });

    doc.end();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

  } catch (err) {
    console.error('getSalePDF error:', err);
    res.status(500).json({ msg: 'Error al generar PDF' });
  }
};

module.exports = {
  createSale,
  createCustomerSale,
  getTodaySales,
  getAllSales,
  getSalesStats,
  getSalePDF
};