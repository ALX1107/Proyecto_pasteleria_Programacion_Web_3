// hash.js
const bcrypt = require('bcryptjs');

// Script sencillo para generar un hash de prueba desde CLI.
// Uso: node hash.js <password>
(async () => {
  const pwd = process.argv[2];
  if (!pwd) {
    console.log('Proporciona una contraseña como argumento');
    process.exit(1);
  }
  const hash = await bcrypt.hash(pwd, 10);
  console.log('Hash generado:', hash);
})();
