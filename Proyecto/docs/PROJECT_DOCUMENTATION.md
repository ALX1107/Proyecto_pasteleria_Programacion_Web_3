# Documentación Técnica del Proyecto

## Índice
- [Arquitectura general](#arquitectura-general)
- [Dependencias](#dependencias)
- [Configuración de entorno](#configuración-de-entorno)
- [Modelo de datos](#modelo-de-datos)
- [Endpoints](#endpoints)
- [Flujos de seguridad](#flujos-de-seguridad)
- [Frontend (React/Vite)](#frontend-reactvite)
- [Comandos de ejecución](#comandos-de-ejecución)

---

## Arquitectura general
Aplicación full-stack para operación diaria de una pastelería:
- **Backend:** API REST con Node.js/Express y MongoDB (Mongoose).
- **Frontend:** React 19 con Vite, React Router 7 y Axios.
- **Auth:** JWT con roles `Admin` y `Employee`.
- **Gráficas:** Chart.js / React-ChartJS-2.
- **Estilos:** Paleta crema (#FCFCE3), verde (#73D1B4), morado (#F7A1F7) y rojo (#EE4242).

## Dependencias
### Backend
- express, cors, morgan, dotenv
- mongoose
- bcryptjs, jsonwebtoken
- svg-captcha

### Frontend
- react, react-dom, react-router-dom@7
- axios
- chart.js, react-chartjs-2
- Vite + @vitejs/plugin-react

## Configuración de entorno
- Backend (`backend/.env`):
  - `MONGO_URI` (obligatorio)
  - `JWT_SECRET` (obligatorio)
  - `JWT_EXPIRES` (opcional, por defecto `1d`)
  - `PORT` (opcional, por defecto `4000`)
- Frontend (`frontend/.env`):
  - `VITE_API_URL` (opcional, por defecto `http://localhost:4000`)

## Modelo de datos
- **User**: nombre, apellidos, edad, correo único, dirección, celular, contraseña (hash), rol (`Admin`/`Employee`).
- **Product**: nombre, costo, stock, unidad.
- **Sale**: items [{ nombre, cantidad, precio }], total, método de pago, usuarioId ref User, usuario (texto), timestamps.
- **Staff**: nombre, rol, horario, contacto, sueldo, último pago, activo, timestamps.

## Endpoints
Base: `/api`

### Auth (`/auth`)
- `POST /login` — valida captcha opcional, compara hash, firma JWT.
- `GET /captcha` — genera SVG con TTL 10 min, máximo 200 en memoria.
- `POST /register` — solo Admin; crea usuario con hash y datos de contacto.
- `POST /logout` — requiere sesión, responde OK.

### Productos (`/products`)
- `GET /` — lista inventario (público).
- `POST /` — crea producto (Admin).
- `PUT /:id` — actualiza producto (Admin).
- `DELETE /:id` — elimina producto (Admin).

### Estadísticas/Ventas (`/stats`)
- `GET /sales-by-product` — agrega ventas por producto (Admin).
- `POST /sales` — registra venta en transacción, valida stock y descuenta inventario (requiere auth).
- `GET /sales-history` — historial filtrable por fechas, usuario (solo admin) y método de pago; restringe a ventas propias si no es admin.

### Reportes (`/reports`)
- `GET /access-logs/pdf` — genera PDF simple con marca temporal y usuario; solo Admin.

### Personal (`/staff`)
- Todas requieren auth + rol admin:
  - `GET /` — listar
  - `POST /` — crear
  - `PUT /:id` — actualizar
  - `DELETE /:id` — eliminar
  - `POST /:id/payroll` — marca fecha de último pago

## Flujos de seguridad
- **JWT**: middleware `protect` verifica token y recupera usuario; `requireAdmin` fuerza rol.
- **Captcha**: almacenado en memoria con TTL y límite; no se loguean credenciales.
- **Ventas**: transacción Mongoose valida existencia y stock; calcula total; aborta ante error.
- **Historial**: si el usuario no es admin, se filtra por su `usuarioId`.

## Frontend (React/Vite)
- **Contexto Auth** (`AuthContext`): login con captcha, guarda usuario/token en `localStorage`, logout y registro admin-only.
- **Rutas**:
  - Públicas: `/login` (redirige según estado)
  - Protegidas (envueltas por `AppLayout` + Navbar): `/products`, `/register`, `/staff`
- **Páginas**:
  - `Products`: lista inventario, carrito y cobro con método de pago, CRUD admin, gráfica de ventas/stock, historial filtrable.
  - `Register`: alta de usuarios con validación y fuerza de contraseña (solo Admin).
  - `Login`: formulario con captcha SVG opcional.
  - `StaffManagement`: panel con paleta crema/verde/morado/rojo para horarios, bajas, sueldos (solo Admin), incluye placeholders si no hay datos.
- **Componentes**:
  - `Navbar`: navegación, descarga de reporte PDF (Admin), logout.
  - `ProductList`: inventario + carrito y checkout hacia `/api/stats/sales`.
  - `SalesHistory`: tabla con filtros de fecha, usuario (Admin) y método de pago.
  - `Input`: campo estilizado reutilizable.
  - `AppLayout`: protege rutas y muestra Navbar.

## Comandos de ejecución
- Backend:
  ```bash
  cd backend
  npm install
  npm start   # usa PORT o 4000
