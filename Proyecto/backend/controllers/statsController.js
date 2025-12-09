// controllers/statsController.js
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// GET /api/stats/sales-by-product
const getSalesByProduct = async (req, res) => {
  try {
    const pipeline = [
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.nombre',
          totalCantidad: { $sum: '$items.cantidad' },
          revenue: {
            $sum: { $multiply: ['$items.cantidad', '$items.precio'] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          nombre: '$_id',
          totalCantidad: 1,
          revenue: 1
        }
      },
      { $sort: { totalCantidad: -1 } }
    ];

    const results = await Sale.aggregate(pipeline);
    return res.json(results);
  } catch (error) {
    console.error('Error al obtener ventas por producto:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
};

// POST /api/stats/sales
const createSale = async (req, res) => {
  let session;
  try {
    const { items, total, metodoPago } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: 'Items de la venta son requeridos' });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const validatedItems = [];
    for (const item of items) {
      const product = await Product.findOne({ nombre: item.nombre }).session(session);
      if (!product) {
        throw new Error(`Producto no encontrado: ${item.nombre}`);
      }
      if (typeof item.cantidad !== 'number' || item.cantidad <= 0) {
        throw new Error('Cantidad inválida en ítem de venta');
      }
      if (product.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para ${item.nombre}`);
      }

      product.stock -= item.cantidad;
      await product.save({ session });
      validatedItems.push(item);
    }

    const recalculatedTotal = validatedItems.reduce(
      (acc, item) => acc + (item.precio || 0) * item.cantidad,
      0
    );

    const saleData = {
      items: validatedItems,
      total: total || recalculatedTotal,
      metodoPago: metodoPago || 'Efectivo',
      usuarioId: req.user ? req.user._id : undefined,
      usuario: req.user ? req.user.nombre || req.user.correo : 'Invitado'
    };

    const [sale] = await Sale.create([saleData], { session });

    await session.commitTransaction();
    return res.status(201).json({
      msg: 'Venta registrada y stock actualizado',
      sale
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error('Error al crear venta:', error.message);
    const clientErrors = ['Stock', 'Producto no encontrado', 'Cantidad inválida'];
    const isClientError = clientErrors.some((label) =>
      (error.message || '').startsWith(label)
    );
    const message = isClientError ? error.message : 'Error del servidor';
    const status = isClientError ? 400 : 500;
    return res.status(status).json({ msg: message });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

// GET /api/stats/sales-history
const getSalesHistory = async (req, res) => {
  try {
    const { startDate, endDate, usuario, metodoPago } = req.query;

    const query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (metodoPago) {
      query.metodoPago = metodoPago;
    }

    if (usuario) {
      query.usuario = { $regex: usuario, $options: 'i' };
    }

    if (!req.user || req.user.rol !== 'Admin') {
      query.usuarioId = req.user?._id;
    }

    const sales = await Sale.find(query).sort({ createdAt: -1 });
    return res.json(sales);
  } catch (error) {
    console.error('Error al obtener historial de ventas:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
};

module.exports = { getSalesByProduct, createSale, getSalesHistory };
