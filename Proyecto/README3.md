# README3.md - Estructura de la Base de Datos

## Estructura de la Base de Datos MongoDB - Sistema de Pastelería Java

Este documento detalla completamente la estructura de la base de datos MongoDB utilizada en el sistema de gestión de pastelería.

## 🗄️ Arquitectura de Base de Datos

### Sistema de Gestión: MongoDB
- **Tipo**: Base de datos NoSQL orientada a documentos
- **Formato**: JSON/BSON para almacenamiento
- **Características**: Flexible, escalable, sin esquema fijo
- **Ventajas**: Rápido desarrollo, fácil modificación de estructura

### Nombre de la Base de Datos
```
pasteleria
```

## 📊 Colecciones Principales

La base de datos consta de **4 colecciones principales** que manejan toda la información del sistema:

### 1. **Colección: `users`** (Usuarios del Sistema)
**Propósito**: Almacena información de usuarios registrados (clientes, empleados, administradores)

#### Esquema de Documento
```javascript
{
  _id: ObjectId,           // ID único generado por MongoDB
  nombre: String,          // Nombre del usuario (requerido)
  apellidos: String,       // Apellidos del usuario (requerido)
  edad: Number,            // Edad en años (requerido)
  correo: String,          // Email único (requerido, único)
  direccion: String,       // Dirección completa (requerido)
  celular: String,         // Número de teléfono (requerido)
  contraseña: String,      // Contraseña hasheada con bcrypt (requerido)
  rol: String,             // Rol: 'Admin' | 'Employee' (default: 'Employee')
  createdAt: Date,         // Fecha de creación automática
  updatedAt: Date          // Fecha de última modificación automática
}
```

#### Características Técnicas
- **Índice único**: `correo` (evita emails duplicados)
- **Hashing**: Contraseña encriptada con bcrypt (10 salt rounds)
- **Método**: `matchPassword()` para verificación de contraseñas
- **Timestamps**: Automáticos con mongoose

#### Datos de Ejemplo (Seed)
```javascript
[
  {
    nombre: "Admin",
    apellidos: "Principal",
    edad: 30,
    correo: "admin@pasteleria.com",
    contraseña: "admin123", // Se hashea automáticamente
    rol: "Admin",
    direccion: "Calle Principal 123",
    celular: "123456789"
  },
  {
    nombre: "Juan",
    apellidos: "Pérez",
    edad: 25,
    correo: "juan@pasteleria.com",
    contraseña: "empleado123", // Se hashea automáticamente
    rol: "Employee",
    direccion: "Avenida Central 456",
    celular: "987654321"
  }
]
```

---

### 2. **Colección: `products`** (Productos)
**Propósito**: Gestión del catálogo de productos de la pastelería

#### Esquema de Documento
```javascript
{
  _id: ObjectId,           // ID único generado por MongoDB
  nombre: String,          // Nombre del producto (requerido)
  descripcion: String,     // Descripción detallada (opcional)
  costo: Number,           // Costo de producción (requerido)
  precioVenta: Number,     // Precio de venta al público (requerido)
  margenGanancia: Number,  // Porcentaje de ganancia (default: 30%)
  stock: Number,           // Cantidad disponible (requerido, default: 0)
  unit: String,            // Unidad de medida (default: 'unidad')
  imagen: String,          // URL de la imagen del producto (opcional)
  nombreImagen: String,    // Nombre del archivo de imagen (opcional)
  createdAt: Date,         // Fecha de creación automática
  updatedAt: Date          // Fecha de modificación automática
}
```

#### Características Técnicas
- **Cálculo automático**: `precioVenta = costo * (1 + margenGanancia/100)`
- **Control de stock**: Validación de disponibilidad antes de venta
- **Unidades**: Sistema flexible (unidad, caja, kg, etc.)
- **Imágenes**: Almacenamiento de URLs de imágenes y nombres de archivos
- **Campo nombreImagen**: Para identificar archivos de imagen en el sistema de archivos

#### Datos de Ejemplo (Seed)
```javascript
[
  {
    nombre: "Tarta de Fresa",
    costo: 25.50,
    precioVenta: 33.15,    // 25.50 * 1.30
    margenGanancia: 30,
    stock: 15,
    unit: "unidad"
  },
  {
    nombre: "Muffin de Chocolate",
    costo: 3.75,
    precioVenta: 4.875,    // 3.75 * 1.30
    stock: 45,
    unit: "unidad"
  },
  {
    nombre: "Caja de Macarons (x6)",
    costo: 18.00,
    precioVenta: 23.40,    // 18.00 * 1.30
    stock: 10,
    unit: "caja"
  }
]
```

---

### 3. **Colección: `sales`** (Ventas)
**Propósito**: Registro completo de todas las transacciones de venta

#### Esquema de Documento
```javascript
{
  _id: ObjectId,           // ID único generado por MongoDB
  items: [{                // Array de productos vendidos
    nombre: String,        // Nombre del producto
    cantidad: Number,      // Cantidad vendida
    precio: Number         // Precio unitario al momento de venta
  }],
  total: Number,           // Total de la venta (requerido)
  metodoPago: String,      // 'Efectivo' | 'Tarjeta' | 'Transferencia'
  cliente: {               // Información del cliente
    nombre: String,        // Nombre del cliente (requerido)
    ci: String,            // CI/NIT (opcional)
    telefono: String,      // Teléfono (opcional)
    direccion: String      // Dirección (opcional)
  },
  usuarioId: ObjectId,     // Referencia al usuario que realizó la venta
  usuario: String,         // Email del usuario que realizó la venta
  fecha: Date,             // Fecha y hora de la venta (default: now)
  createdAt: Date,         // Fecha de creación automática
  updatedAt: Date          // Fecha de modificación automática
}
```

#### Características Técnicas
- **Subdocumentos**: `items` como array embebido (sin colección separada)
- **Referencias**: `usuarioId` apunta a colección `users`
- **Validación**: Stock disponible antes de confirmar venta
- **Actualización automática**: Stock se reduce al confirmar venta

#### Datos de Ejemplo (Seed)
```javascript
[
  {
    usuarioId: ObjectId("..."),
    usuario: "juan@pasteleria.com",
    cliente: {
      nombre: "María López",
      telefono: "71234567"
    },
    items: [
      { nombre: "Tarta de Fresa", cantidad: 1, precio: 25.50 },
      { nombre: "Muffin de Chocolate", cantidad: 2, precio: 3.75 }
    ],
    total: 32.75,
    metodoPago: "Efectivo",
    fecha: "2025-12-01T10:30:00"
  },
  {
    usuarioId: ObjectId("..."),
    usuario: "admin@pasteleria.com",
    cliente: {
      nombre: "Carlos Mendoza",
      telefono: "79876543"
    },
    items: [
      { nombre: "Caja de Macarons (x6)", cantidad: 1, precio: 18.00 }
    ],
    total: 23.40,
    metodoPago: "Tarjeta",
    fecha: "2025-12-01T14:15:00"
  }
]
```

---

### 4. **Colección: `staff`** (Personal de Pastelería Java)
**Propósito**: Gestión del personal administrativo y operativo

#### Esquema de Documento
```javascript
{
  _id: ObjectId,           // ID único generado por MongoDB
  nombre: String,          // Nombre del empleado (requerido)
  apellidos: String,       // Apellidos del empleado (requerido)
  correo: String,          // Email único (requerido, único)
  contraseña: String,      // Contraseña hasheada (requerido)
  edad: Number,            // Edad en años (requerido)
  rol: String,             // 'Admin' | 'Employee' (default: 'Employee')
  horario: String,         // Horario de trabajo (default: '9:00-18:00')
  contacto: String,        // Información de contacto adicional
  sueldo: Number,          // Salario mensual (default: 2500)
  ultimoPago: Date,        // Fecha del último pago realizado
  activo: Boolean,         // Estado del empleado (default: true)
  createdAt: Date,         // Fecha de creación automática
  updatedAt: Date          // Fecha de modificación automática
}
```

#### Características Técnicas
- **Índice único**: `correo` (evita emails duplicados)
- **Hashing**: Contraseña encriptada con bcrypt
- **Método**: `matchPassword()` para autenticación
- **Estado**: Campo `activo` para empleados activos/inactivos

#### Datos de Ejemplo (Seed)
```javascript
[
  {
    nombre: "María González",
    apellidos: "Rodríguez",
    edad: 28,
    correo: "maria@pasteleria.com",
    contraseña: "empleado123", // Hasheada
    rol: "Employee",
    horario: "08:00 - 16:00",
    contacto: "71234567",
    sueldo: 2500,
    activo: true
  },
  {
    nombre: "Carlos López",
    apellidos: "Martínez",
    edad: 32,
    correo: "carlos@pasteleria.com",
    contraseña: "empleado123", // Hasheada
    rol: "Employee",
    horario: "10:00 - 18:00",
    contacto: "79876543",
    sueldo: 2800,
    activo: true
  }
]
```

## 🔗 Relaciones Entre Colecciones

### Diagrama de Relaciones
```
users (usuarios del sistema)
├── Admin: Gestiona todo el sistema
├── Employee: Realiza ventas y gestiona productos
└── Customer: Realiza compras (futuro)

staff (personal administrativo)
├── Admin: Acceso completo al sistema
└── Employee: Acceso limitado a ventas

products (catálogo de productos)
└── Vendidos en → sales.items

sales (registro de ventas)
├── Realizada por → users._id (usuarioId)
├── Realizada por → staff (opcional)
└── Contiene → products (referencias en items)
```

### Tipos de Relaciones
1. **Uno a Muchos**: `users` → `sales` (un usuario puede tener muchas ventas)
2. **Referencia**: `sales.usuarioId` → `users._id`
3. **Embebido**: `sales.items` contiene datos de productos (no referencias)

## 📈 Índices y Optimización

### Índices Automáticos
- **MongoDB**: Índice automático en `_id`
- **Mongoose**: Índices automáticos en campos `unique: true`

### Índices Recomendados
```javascript
// Para búsquedas rápidas por email
db.users.createIndex({ correo: 1 }, { unique: true })
db.staff.createIndex({ correo: 1 }, { unique: true })

// Para filtrado de ventas por fecha
db.sales.createIndex({ fecha: -1 })

// Para ventas por usuario
db.sales.createIndex({ usuarioId: 1 })

// Para productos por stock
db.products.createIndex({ stock: -1 })
```

## 🔒 Seguridad y Validaciones

### Encriptación
- **Contraseñas**: Hash con bcrypt (10 salt rounds)
- **Método de comparación**: `matchPassword()` para login

### Validaciones a Nivel de Base de Datos
- **Campos requeridos**: Enforced por Mongoose schemas
- **Tipos de datos**: Validación automática
- **Valores enumerados**: `rol`, `metodoPago`
- **Índices únicos**: Prevención de duplicados

### Validaciones a Nivel de Aplicación
- **Email**: Formato válido con validator.js
- **Contraseña**: Fortaleza mínima requerida
- **Stock**: Validación antes de venta
- **Referencias**: Existencia de documentos referenciados

## 📊 Consultas Comunes

### Ventas por Usuario
```javascript
db.sales.find({ usuarioId: ObjectId("...") })
```

### Productos con Stock Bajo
```javascript
db.products.find({ stock: { $lt: 10 } })
```

### Ventas por Fecha
```javascript
db.sales.find({
  fecha: {
    $gte: new Date("2025-12-01"),
    $lt: new Date("2025-12-31")
  }
})
```

### Total de Ventas por Método de Pago
```javascript
db.sales.aggregate([
  { $group: { _id: "$metodoPago", total: { $sum: "$total" } } }
])
```

## 🚀 Escalabilidad y Rendimiento

### Optimizaciones Implementadas
- **Índices estratégicos**: Para consultas frecuentes
- **Subdocumentos**: `sales.items` evita JOINs complejos
- **Referencias selectivas**: Solo cuando necesario
- **Paginación**: Para listados grandes

### Consideraciones de Crecimiento
- **Sharding**: Posible por `_id` o campos personalizados
- **Compresión**: BSON nativo
- **Caché**: Implementable a nivel de aplicación

## 🛠️ Mantenimiento

### Backup y Restauración
```bash
# Backup completo
mongodump --db pasteleria --out /path/to/backup

# Restauración
mongorestore --db pasteleria /path/to/backup/pasteleria
```

### Monitoreo
- **Conexiones activas**: `db.serverStatus().connections`
- **Uso de índices**: `db.collection.stats()`
- **Tamaño de colección**: `db.collection.totalSize()`

## 📋 Resumen Ejecutivo

| Colección | Documentos | Relaciones | Índices |
|-----------|------------|------------|---------|
| `users` | Usuarios sistema | → `sales` | `correo` (único) |
| `products` | Catálogo productos | → `sales.items` | Ninguno específico |
| `sales` | Registro ventas | → `users` | `fecha`, `usuarioId` |
| `staff` | Personal administrativo | Independiente | `correo` (único) |

**Total de colecciones**: 4
**Relaciones principales**: 3 (users→sales, products→sales, staff independiente)
**Campos indexados**: 6 (incluyendo índices únicos)
**Seguridad**: Encriptación bcrypt + validaciones de aplicación