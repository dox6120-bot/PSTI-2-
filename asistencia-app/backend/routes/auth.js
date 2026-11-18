const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');

router.post('/login', async (req, res) => {
  const { cedula, password } = req.body;
  if (!cedula || !password)
    return res.status(400).json({ error: 'Complete cédula y contraseña' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE cedula=? AND activo=1', [cedula]
    );
    if (!rows.length)
      return res.status(401).json({ error: 'Credenciales inválidas' });

    const u = rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: u.id, cedula: u.cedula, nombre: u.nombre, apellido: u.apellido, rol: u.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: { id: u.id, cedula: u.cedula, nombre: u.nombre, apellido: u.apellido, rol: u.rol }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;