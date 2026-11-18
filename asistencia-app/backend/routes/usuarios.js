const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool   = require('../config/db');
const { verificarToken, soloAdmin } = require('../middleware/auth');

router.use(verificarToken, soloAdmin);

router.get('/', async (_req, res) => {
  const [rows] = await pool.query(
    'SELECT id, cedula, nombre, apellido, email, rol, activo FROM usuarios ORDER BY id DESC'
  );
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { cedula, nombre, apellido, email, password, rol } = req.body;
  if (!cedula || !nombre || !apellido || !email || !password || !rol)
    return res.status(400).json({ error: 'Datos incompletos' });
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO usuarios (cedula,nombre,apellido,email,password_hash,rol) VALUES (?,?,?,?,?,?)',
      [cedula, nombre, apellido, email, hash, rol]
    );
    res.json({ ok: true });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ error: 'Cédula o email ya existen' });
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.put('/:id', async (req, res) => {
  const { nombre, apellido, email, rol, activo, password } = req.body;
  const campos = []; const valores = [];
  if (nombre)  { campos.push('nombre=?');   valores.push(nombre); }
  if (apellido){ campos.push('apellido=?'); valores.push(apellido); }
  if (email)   { campos.push('email=?');    valores.push(email); }
  if (rol)     { campos.push('rol=?');      valores.push(rol); }
  if (activo !== undefined){ campos.push('activo=?'); valores.push(activo ? 1 : 0); }
  if (password){ campos.push('password_hash=?'); valores.push(await bcrypt.hash(password,10)); }
  if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' });

  valores.push(req.params.id);
  await pool.query(`UPDATE usuarios SET ${campos.join(',')} WHERE id=?`, valores);
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM usuarios WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;