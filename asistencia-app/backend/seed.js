require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool   = require('./config/db');

(async () => {
  const password = 'Admin123*';
  const hash = await bcrypt.hash(password, 10);
  try {
    await pool.query(
      `INSERT INTO usuarios (cedula,nombre,apellido,email,password_hash,rol)
       VALUES (?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)`,
      ['V-00000001', 'Administrador', 'Principal',
       'admin@uejmbp.edu.ve', hash, 'administrador']
    );
    console.log('✅ Admin creado -> cédula: V-00000001 | password:', password);
    process.exit(0);
  } catch (e) {
    console.error(e); process.exit(1);
  }
})();