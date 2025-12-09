# Pastelería Java - Sistema de Gestión de Café y Postres - Documentación Completa

## Descripción del Proyecto

Esta aplicación web es un sistema completo de gestión para una cafetería que permite manejar inventario de productos, ventas, personal y administración. Incluye un carrito de compras con pagos por tarjeta y generación automática de recibos en PDF.

## Funcionalidades Principales

### Para Clientes
- **Carrito de Compras**: Agregar productos, modificar cantidades, ver totales
- **Gestión del Carrito**:
  - Quitar productos individuales (botón 🗑️)
  - Vaciar carrito completo (botón "Vaciar Carrito")
  - Modificar cantidades con input numérico
- **Pago con Tarjeta**: Integración con Stripe para pagos seguros
- **Pago en Efectivo/Transferencia**: Opciones tradicionales
- **Recibo en PDF**: Descarga automática del recibo después de la compra
- **Datos del Cliente**: Registro de nombre, CI/NIT, teléfono y dirección

### Para Empleados
- **Gestión de Ventas**: Registro de ventas con actualización automática de stock
- **Historial de Ventas**: Consulta de ventas del día
- **Gestión de Productos**: Ver productos disponibles

### Para Administradores
- **Gestión de Productos**: Crear, editar, eliminar productos
- **Gestión de Personal**: Administrar empleados
- **Reportes**: Estadísticas de ventas y reportes detallados
- **Dashboard**: Panel de control con métricas

## Gestión de Imágenes de Productos

### Almacenamiento de Imágenes
- **Carpeta dedicada**: `backend/uploads/productos/` para organizar las imágenes de productos
- **Campo en base de datos**: El modelo `Product` incluye un campo `imagen` que almacena la ruta relativa del archivo
- **Servidor de archivos estáticos**: Las imágenes se sirven desde `/uploads/` en el backend

### Funcionalidades
- **Subida de imágenes**: Los administradores pueden subir imágenes al crear/editar productos
- **Visualización**: Las imágenes se muestran en la página de productos para clientes y en la gestión de productos para administradores
- **Apertura de imágenes**: Click en las imágenes para abrir en nueva pestaña
- **Nombre del archivo**: Se muestra el nombre del archivo de imagen en la tabla de gestión

### Especificaciones Técnicas
- **Formatos aceptados**: JPG, PNG, GIF
- **Tamaño máximo**: 5MB por imagen
- **Nomenclatura**: Archivos nombrados automáticamente con timestamp + nombre original
- **Ruta de acceso**: `/uploads/productos/nombre_archivo.ext`

## Carrusel Interactivo de la Página Principal

### Funcionalidades del Carrusel
- **Navegación automática**: Cambia automáticamente cada 5 segundos
- **Controles manuales**: Botones anterior/siguiente para navegación inmediata
- **Indicadores clickeables**: Puntos en la parte inferior para ir directamente a cualquier slide
- **Pausa al hacer hover**: Se detiene la reproducción automática al pasar el mouse
- **Botones de acción**: Cada slide tiene un botón con acción específica
- **Barra de progreso**: Muestra el progreso del slide actual
- **Transiciones suaves**: Animaciones CSS para cambios fluidos

### Slides del Carrusel
1. **Postres Artesanales**
   - Descripción: "Elaborados con los mejores ingredientes y mucho amor"
   - Botón: "Ver Catálogo" → Redirige a `/products`

2. **Tartas Personalizadas**
   - Descripción: "Creamos el postre perfecto para tu ocasión especial"
   - Botón: "Pedir Ahora" → Redirige a `/products` (o login si no está autenticado)

3. **Entrega a Domicilio**
   - Descripción: "Llevamos la dulzura directamente a tu puerta"
   - Botón: "Contactar" → Muestra alerta con número de teléfono

### Características Técnicas
- **Framework**: React con hooks (useState, useEffect)
- **Transiciones**: CSS transitions para opacidad
- **Responsive**: Adaptable a dispositivos móviles
- **Accesibilidad**: Etiquetas ARIA y navegación por teclado
- **Rendimiento**: Optimizado con cleanup de intervalos

## Sistema de Gestión de Imágenes de Productos

### 📁 Estructura de Archivos de Imágenes
```
backend/uploads/
├── productos/           # Imágenes de productos
│   ├── tarta_fresa_001.jpg
│   ├── muffin_chocolate_002.png
│   └── macarons_x6_003.jpg
└── ...                  # Otros archivos
```

### 🗄️ Campos en Base de Datos
- **`imagen`**: URL completa para acceder a la imagen desde el frontend
- **`nombreImagen`**: Nombre del archivo físico almacenado en el servidor

### 🔧 Configuración del Servidor
- **Directorio**: `backend/uploads/productos/`
- **Acceso**: Archivos servidos estáticamente desde `/uploads/`
- **Validación**: Solo archivos de imagen (jpg, png, gif, webp)

### 📤 Subida de Imágenes
- **Método**: POST multipart/form-data
- **Endpoint**: `/api/products` (crear/editar producto)
- **Campo**: `imagen` (archivo)
- **Procesamiento**: Renombrado automático con timestamp

### 📥 Acceso a Imágenes
- **URL**: `http://localhost:4000/uploads/productos/{nombreImagen}`
- **Frontend**: `<img src={producto.imagen} alt={producto.nombre} />`
- **Fallback**: Imagen por defecto si no existe

## 🎨 Personalización de la Interfaz

### Icono de la Página (Favicon)
- **Ubicación**: `frontend/public/favicon.ico`
- **Configuración**: Actualizado en `index.html` para usar favicon personalizado
- **Tipo**: Icono ICO estándar para compatibilidad con navegadores
- **Estado**: Actualizado con nueva imagen personalizada

### Logo de la Pastelería
- **Ubicación**: `frontend/public/logo.png`
- **Uso**: Logo principal en el header de la aplicación
- **Configuración**: Actualizado en `Header.jsx` y `Header.css`
- **Tamaño**: 40x40 píxeles con `object-fit: contain`

## Tecnologías Utilizadas

### Backend
- **Node.js** con **Express.js**: Servidor web y API REST
- **MongoDB** con **Mongoose**: Base de datos NoSQL
- **JWT**: Autenticación y autorización
- **bcryptjs**: Encriptación de contraseñas
- **Stripe**: Procesamiento de pagos con tarjeta
- **PDFKit**: Generación de documentos PDF
- **Multer**: Manejo de archivos (imágenes de productos)
- **CORS**: Comunicación entre frontend y backend

### Frontend
- **React** con **Vite**: Framework moderno para interfaces
- **React Router**: Navegación entre páginas
- **Axios**: Cliente HTTP para API
- **Chart.js**: Gráficos en el dashboard
- **Stripe Elements**: Formularios de pago seguros
- **CSS Modules**: Estilos modulares

### Librerías Adicionales
- **Morgan**: Logging de requests
- **Dotenv**: Variables de entorno
- **SVG Captcha**: Verificación humana

## Estructura del Proyecto

```
pasteleria/
├── backend/                 # Servidor Node.js
│   ├── config/
│   │   └── db.js           # Conexión a MongoDB
│   ├── controllers/        # Lógica de negocio
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── saleController.js
│   │   ├── staffController.js
│   │   ├── reportController.js
│   │   ├── paymentController.js
│   │   └── statsController.js
│   ├── middleware/         # Middlewares personalizados
│   │   ├── authMiddleware.js
│   │   ├── customerAuthMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/            # Modelos de datos
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Sale.js
│   │   └── Staff.js
│   ├── routes/            # Definición de rutas
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── saleRoutes.js
│   │   ├── staffRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── customerRoutes.js
│   ├── uploads/           # Archivos subidos
│   │   └── productos/     # Imágenes de productos
│   ├── server.js          # Punto de entrada
│   ├── seed.js            # Datos de prueba
│   └── package.json
├── frontend/               # Aplicación React
│   ├── public/
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   │   ├── Header.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── CheckoutForm.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   └── AppLayout.jsx
│   │   ├── contexts/      # Contextos React
│   │   │   └── AuthContext.jsx
│   │   ├── pages/         # Páginas principales
│   │   │   ├── HomePage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductManagement.jsx
│   │   │   ├── SalesHistory.jsx
│   │   │   ├── StaffManagement.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── assets/        # Recursos estáticos
│   │   ├── App.jsx        # Componente raíz
│   │   ├── main.jsx       # Punto de entrada
│   │   ├── stripe.js      # Configuración Stripe
│   │   ├── index.css      # Estilos globales
│   │   └── mockData.js    # Datos de ejemplo
│   ├── vite.config.js
│   └── package.json
├── docs/                   # Documentación
├── scripts/                # Scripts de utilidad
└── README.md
```

## Base de Datos

> 📖 **Documentación detallada de la base de datos**: Ver [README3.md](README3.md) para información completa sobre la estructura de la base de datos MongoDB.

### Colecciones MongoDB

#### Usuarios (`users`)
```javascript
{
  _id: ObjectId,
  nombre: String (requerido),
  correo: String (requerido, único),
  password: String (requerido, encriptado),
  type: String (enum: ['admin', 'staff', 'customer']),
  createdAt: Date,
  updatedAt: Date
}
```

#### Productos (`products`)
```javascript
{
  _id: ObjectId,
  nombre: String (requerido),
  costo: Number (requerido),
  stock: Number (requerido),
  unit: String (requerido),
  imagen: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Ventas (`sales`)
```javascript
{
  _id: ObjectId,
  items: [{
    nombre: String,
    cantidad: Number,
    precio: Number
  }],
  total: Number,
  metodoPago: String (enum: ['Efectivo', 'Tarjeta', 'Transferencia']),
  cliente: {
    nombre: String,
    ci: String,
    telefono: String,
    direccion: String
  },
  usuarioId: ObjectId (ref: 'User'),
  usuario: String,
  fecha: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Personal (`staff`)
```javascript
{
  _id: ObjectId,
  nombre: String (requerido),
  correo: String (requerido),
  cargo: String (requerido),
  salario: Number,
  fechaContratacion: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- MongoDB (local o Atlas)
- npm o yarn

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/ALX1107/Proyecto_final_Pasteleria.git
   cd Proyecto_final_Pasteleria
   ```

2. **Configurar Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

3. **Configurar Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configurar Variables de Entorno**

   Editar `backend/.env`:
   ```env
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/pasteleria
   JWT_SECRET=tu_secreto_jwt_seguro_aqui
   STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_de_stripe
   STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_de_stripe
   ```

   Editar `frontend/.env` (si es necesario):
   ```env
   VITE_API_URL=http://localhost:4000
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_de_stripe
   ```

### Ejecución

1. **Iniciar MongoDB**
   ```bash
   mongod
   ```

2. **Iniciar Backend**
   ```bash
   cd backend
   npm run dev
   ```

3. **Iniciar Frontend** (en otra terminal)
   ```bash
   cd frontend
   npm run dev
   ```

4. **Acceder a la aplicación**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000

### Poblar Base de Datos
```bash
cd backend
npm run seed
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual

### Productos
- `GET /api/products` - Obtener todos los productos
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)

### Ventas
- `POST /api/sales` - Crear venta (empleados autenticados)
- `POST /api/sales/customer` - Crear venta (clientes sin autenticación)
- `GET /api/sales/today` - Ventas del día (usuario actual)
- `GET /api/sales` - Todas las ventas (admin)
- `GET /api/sales/:id/pdf` - Descargar recibo PDF

### Pagos
- `POST /api/payments/create-payment-intent` - Crear intención de pago
- `POST /api/payments/confirm-payment` - Confirmar pago

### Personal
- `GET /api/staff` - Obtener personal (admin)
- `POST /api/staff` - Crear empleado (admin)
- `PUT /api/staff/:id` - Actualizar empleado (admin)
- `DELETE /api/staff/:id` - Eliminar empleado (admin)

### Estadísticas
- `GET /api/stats` - Estadísticas de ventas

### Reportes
- `GET /api/reports/sales` - Reporte de ventas
- `GET /api/reports/products` - Reporte de productos

## Flujo de Compra

### Para Empleados (Autenticados)
1. **Empleado inicia sesión** con credenciales válidas
2. **Accede a la página de productos** (`/products`)
3. **Agrega productos al carrito**
4. **Gestiona el carrito**:
   - Modifica cantidades con inputs numéricos
   - Quita productos individuales con botón 🗑️
   - Vacía todo el carrito con "Vaciar Carrito"
5. **Hace clic en "Proceder al Pago"**
6. **Ingresa datos del cliente**
7. **Selecciona método de pago**
8. **Sistema procesa venta**: Actualiza stock, guarda venta con usuario asignado
9. **Descarga automática del recibo PDF**

### Para Clientes (Sin Autenticación)
1. **Cliente accede directamente** a la página de productos (`/products`)
2. **Agrega productos al carrito**
3. **Gestiona el carrito**:
   - Modifica cantidades con inputs numéricos
   - Quita productos individuales con botón 🗑️
   - Vacía todo el carrito con "Vaciar Carrito"
4. **Hace clic en "Proceder al Pago"**
5. **Ingresa datos del cliente**
6. **Selecciona método de pago**
   - **Efectivo/Transferencia**: Completa venta directamente
   - **Tarjeta**: Aparece formulario Stripe
7. **Si es tarjeta**: Ingresa datos de tarjeta y confirma pago
8. **Sistema procesa venta**: Actualiza stock, guarda venta como "Cliente Online"
9. **Descarga automática del recibo PDF**

### Diferencias por Tipo de Usuario

| Característica | Empleado | Cliente |
|---|---|---|
| Autenticación requerida | ✅ Sí | ❌ No |
| Acceso a historial de ventas | ✅ Sí | ❌ No |
| Gestión de productos | ✅ Sí (admin) | ❌ No |
| Gestión de personal | ✅ Sí (admin) | ❌ No |
| Dashboard administrativo | ✅ Sí (admin) | ❌ No |
| Carrito de compras | ✅ Sí | ✅ Sí |
| Pago con tarjeta | ✅ Sí | ✅ Sí |
| Recibo PDF | ✅ Sí | ✅ Sí |
| Usuario asignado a venta | ✅ Sí | ❌ No (se marca como "Cliente Online") |

## Seguridad

- **Autenticación JWT**: Tokens seguros con expiración
- **Encriptación de contraseñas**: bcryptjs
- **Validación de datos**: En backend y frontend
- **Validación de email**: Verificación de formato con @ y .
- **Fuerza de contraseña**: Indicador visual que evalúa la seguridad de la contraseña
- **CORS**: Configurado para desarrollo
- **Stripe**: Pagos seguros PCI compliant

### Validaciones de Registro

#### Email
- **Formato válido**: Debe contener @ y al menos un punto (.)
- **Ejemplos válidos**: usuario@email.com, test.user@domain.co
- **Ejemplos inválidos**: usuarioemail.com, usuario@email

#### Contraseña
La fuerza de la contraseña se evalúa en tiempo real y se clasifica como:

- **Débil** (Rojo): Menos de 3 criterios cumplidos
- **Normal** (Naranja): 3 criterios cumplidos
- **Segura** (Verde): 4-5 criterios cumplidos

**Criterios de evaluación:**
- ✅ Longitud mínima de 8 caracteres
- ✅ Contiene letras minúsculas (a-z)
- ✅ Contiene letras mayúsculas (A-Z)
- ✅ Contiene números (0-9)
- ✅ Contiene caracteres especiales (!@#$%^&*()_+-=[]{}|;':",./<>?)

**Indicador visual**: Barra de progreso que muestra el nivel de seguridad en tiempo real.

### Validaciones de Empleados

Las mismas validaciones de email y contraseña aplican para la creación de empleados en el panel administrativo:

- **Validación de email**: Formato correcto con @ y .
- **Validación de contraseña**: Indicador visual de fuerza de contraseña
- **Prevención de contraseñas débiles**: No se permite crear empleados con contraseñas débiles
- **Feedback visual**: Indicador de fuerza de contraseña en tiempo real durante la creación

## Despliegue

### Backend
- **Railway**, **Render** o **Heroku** recomendado
- Variables de entorno requeridas
- MongoDB Atlas para base de datos

### Frontend
- **Vercel**, **Netlify** o **GitHub Pages**
- Build con `npm run build`
- Configurar variables de entorno

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.

## Contacto

Para preguntas o soporte, contactar al equipo de desarrollo.