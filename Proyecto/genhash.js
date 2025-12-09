// generarHash.js
const bcrypt = require('bcryptjs');

async function main() {
  const password = 'empleado123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash para empleado123:', hash);
}

main();
db.users.updateOne(
  { correo: "juan@pasteleria.com" },
  {
    $set: {
      contraseña: "$2b$10$py0l/3zCXRnaZXPc0M4cMed2F7EYnYFwqp2jmGknu3ce252gGPXbm"
    }
  }
)
