// genhash-admin.js
const bcrypt = require('bcryptjs');
(async () => {
  console.log(await bcrypt.hash('LuisEmp123', 10));
})();
db.users.insertMany([
  {
    nombre: "Ana",
    apellidos: "Admin",
    edad: 30,
    correo: "ana.admin@pasteleria.com",
    direccion: "Av. Central 100",
    celular: "70000001",
    contraseña: "$2b$10$GYIptqGNG.B7rD8/b64J6OMpZyQt/f9Rdx/p15w1dqPBFO6PO1z/K",
    rol: "Admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0
  },
  {
    nombre: "Luis",
    apellidos: "Empleado",
    edad: 24,
    correo: "luis.empleado@pasteleria.com",
    direccion: "Calle 5 #20",
    celular: "70000002",
    contraseña: "$2b$10$QIEp0nka3Gv0IqSMualfnedcr/o0uNE5T9bNnySryCpfpmOUGDuie",
    rol: "Employee",
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0
  }
])
//revisar los endpoint, las rutas de llegada (y generar nuevas pesatañas si en necesario)
//Agregar productos(se deben llenar todos los campos para crear un nuevo producto, agregar un margen de ganancia del 30% por producto ya que el precion ingresado es el de produccion, y al ingreasar el producto se agrega este porcentaje de ganancia que se registrara tambien en la base de datos)
//que todos los productos de la base de datos se muestren en la pantalla principal justo con su imagen y su descripcion 
//en la pestaña de administrar empleados debe haber un boton para crear nuevos empleados, y actualizar su datos 
//grafico en forma de dona (productos mas vendidos)
// grafico en forma  de barras(nro ventas por empleado)
// grafico en formade barras(monto de ventas por meses)
// grafico en forma torta (promedio de ganancias por meses)
//todos los graficos son exclusivos para la cuenta del administrador
// generar un pdf con la informacion de la pagina, otro pdf con la estructura de la base de datos 