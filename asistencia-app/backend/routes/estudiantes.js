const router = require('express').Router();
const pool   = require('../config/db');
const { verificarToken, soloAdmin } = require('../middleware/auth');

router.use(verificarToken);

router.get('/', async (req, res) => {
  const { curso_id } = req.query;
  let sql = `SELECT e.*, c.nombre AS curso_nombre, c.anio, c.seccion
             FROM estudiantes e LEFT JOIN cursos c ON c.id = e.curso_id`;
  const params = [];
  if (curso_id) { sql += ' WHERE e.curso_id=?'; params.push(curso_id); }
  sql += ' ORDER BY e.apellido, e.nombre';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.post('/', soloAdmin, async (req, res) => {
  const { cedula, nombre, apellido, fecha_nac, representante, telefono, curso_id } = req.body;
  try {
    await pool.query(
      `INSERT INTO estudiantes (cedula,nombre,apellido,fecha_nac,representante,telefono,curso_id)
       VALUES (?,?,?,?,?,?,?)`,
      [cedula, nombre, apellido, fecha_nac || null, representante || null,
       telefono || null, curso_id || null]
    );
    res.json({ ok: true });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ error: 'Cédula ya registrada' });
    res.status(500).json({ error: 'Error al crear estudiante' });
  }
});

router.put('/:id', soloAdmin, async (req, res) => {
  const { nombre, apellido, curso_id, activo, representante, telefono } = req.body;
  const campos = []; const valores = [];
  if (nombre)        { campos.push('nombre=?');        valores.push(nombre); }
  if (apellido)      { campos.push('apellido=?');      valores.push(apellido); }
  if (curso_id)      { campos.push('curso_id=?');      valores.push(curso_id); }
  if (representante !== undefined){ campos.push('representante=?'); valores.push(representante); }
  if (telefono !== undefined){ campos.push('telefono=?'); valores.push(telefono); }
  if (activo !== undefined){ campos.push('activo=?');  valores.push(activo ? 1 : 0); }
  if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' });
  valores.push(req.params.id);
  await pool.query(`UPDATE estudiantes SET ${campos.join(',')} WHERE id=?`, valores);
  res.json({ ok: true });
});

router.delete('/:id', soloAdmin, async (req, res) => {
  await pool.query('DELETE FROM estudiantes WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;