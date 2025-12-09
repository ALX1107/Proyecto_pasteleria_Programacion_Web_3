// seed.js - Script para poblar la base de datos con datos de prueba
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');
const Staff = require('./models/Staff');
const bcrypt = require('bcryptjs');
const Sale = require('./models/Sale');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado para seed');
  } catch (err) {
    console.error('Error conectando a MongoDB:', err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Limpiar datos existentes
    await Product.deleteMany();
    await User.deleteMany();
    await Staff.deleteMany();
    await Staff.deleteMany();

    // Crear productos de prueba
    const products = [
      { nombre: 'Tarta de Fresa', costo: 25.50, precioVenta: 33.15, stock: 15, unit: 'unidad' },
      { nombre: 'Muffin de Chocolate', costo: 3.75, precioVenta: 4.875, stock: 45, unit: 'unidad' },
      { nombre: 'Caja de Macarons (x6)', costo: 18.00, precioVenta: 23.40, stock: 10, unit: 'caja' },
      { nombre: 'Pan de Masa Madre', costo: 8.50, precioVenta: 11.05, stock: 22, unit: 'unidad' },
    ];

    await Product.insertMany(products);
    console.log('Productos insertados');

    // Crear usuario admin de prueba
    const adminUser = {
      nombre: 'Admin',
      apellidos: 'Principal',
      edad: 30,
      correo: 'admin@pasteleria.com',
      contraseña: 'admin123',
      rol: 'Admin',
      direccion: 'Calle Principal 123',
      celular: '123456789'
    };

    const admin = await User.create(adminUser);
    console.log('Usuario admin creado: admin@pasteleria.com / admin123');

    // Crear usuario empleado de prueba
    const employeeUser = {
      nombre: 'Juan',
      apellidos: 'Pérez',
      edad: 25,
      correo: 'juan@pasteleria.com',
      contraseña: 'empleado123',
      rol: 'Employee',
      direccion: 'Avenida Central 456',
      celular: '987654321'
    };

    const employee = await User.create(employeeUser);
    console.log('Usuario empleado creado: juan@pasteleria.com / empleado123');

    // Crear empleados de prueba
    const empleados = [
      {
        nombre: 'María González',
        apellidos: 'Rodríguez',
        edad: 28,
        correo: 'maria@pasteleria.com',
        contraseña: await bcrypt.hash('empleado123', 10),
        rol: 'Employee',
        horario: '08:00 - 16:00',
        contacto: '71234567',
        sueldo: 2500
      },
      {
        nombre: 'Carlos López',
        apellidos: 'Martínez',
        edad: 32,
        correo: 'carlos@pasteleria.com',
        contraseña: await bcrypt.hash('empleado123', 10),
        rol: 'Employee',
        horario: '10:00 - 18:00',
        contacto: '79876543',
        sueldo: 2800
      },
      {
        nombre: 'Ana Torres',
        apellidos: 'Sánchez',
        edad: 25,
        correo: 'ana@pasteleria.com',
        contraseña: await bcrypt.hash('empleado123', 10),
        rol: 'Employee',
        horario: '12:00 - 20:00',
        contacto: '75678901',
        sueldo: 2400
      }
    ];

    await Staff.insertMany(empleados);
    console.log('Empleados de prueba creados');

    // Crear ventas de prueba
    const ventas = [
      {
        usuarioId: employee._id,
        usuario: 'juan@pasteleria.com',
        cliente: { nombre: 'María López', telefono: '71234567' },
        items: [
          { nombre: 'Tarta de Fresa', cantidad: 1, precio: 25.50 },
          { nombre: 'Muffin de Chocolate', cantidad: 2, precio: 3.75 }
        ],
        total: 32.75,
        metodoPago: 'Efectivo',
        fecha: new Date('2025-12-01T10:30:00')
      },
      {
        usuarioId: admin._id,
        usuario: 'admin@pasteleria.com',
        cliente: { nombre: 'Carlos Mendoza', telefono: '79876543' },
        items: [
          { nombre: 'Caja de Macarons (x6)', cantidad: 1, precio: 18.00 },
          { nombre: 'Pan de Masa Madre', cantidad: 3, precio: 8.50 }
        ],
        total: 43.50,
        metodoPago: 'Tarjeta',
        fecha: new Date('2025-12-01T14:15:00')
      },
      {
        usuarioId: employee._id,
        usuario: 'juan@pasteleria.com',
        cliente: { nombre: 'Ana García', telefono: '75678901' },
        items: [
          { nombre: 'Tarta de Fresa', cantidad: 2, precio: 25.50 }
        ],
        total: 51.00,
        metodoPago: 'Transferencia',
        fecha: new Date('2025-12-02T09:45:00')
      },
      {
        usuarioId: admin._id,
        usuario: 'admin@pasteleria.com',
        cliente: { nombre: 'Roberto Silva', telefono: '72345678' },
        items: [
          { nombre: 'Muffin de Chocolate', cantidad: 5, precio: 3.75 },
          { nombre: 'Pan de Masa Madre', cantidad: 1, precio: 8.50 }
        ],
        total: 27.25,
        metodoPago: 'Efectivo',
        fecha: new Date('2025-12-02T16:20:00')
      },
      {
        usuarioId: employee._id,
        usuario: 'juan@pasteleria.com',
        cliente: { nombre: 'Patricia Torres', telefono: '73456789' },
        items: [
          { nombre: 'Caja de Macarons (x6)', cantidad: 2, precio: 18.00 }
        ],
        total: 36.00,
        metodoPago: 'Tarjeta',
        fecha: new Date('2025-12-03T11:30:00')
      }
    ];

    await Sale.insertMany(ventas);
    console.log('Ventas de prueba creadas');

    console.log('Datos de prueba insertados exitosamente');
    process.exit();
  } catch (error) {
    console.error('Error insertando datos:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  seedData();
});