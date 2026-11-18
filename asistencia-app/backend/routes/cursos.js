const router = require('express').Router();
const pool   = require('../config/db');
const { verificarToken, soloAdmin } = require('../middleware/auth');

router.use(verificarToken);

router.get('/', async (_req, res) => {
  const [rows] = await pool.query(`
    SELECT c.*, u.nombre AS docente_nombre, u.apellido AS docente_apellido
    FROM cursos c LEFT JOIN usuarios u ON u.id = c.docente_id
    ORDER BY c.anio, c.seccion`);
  res.json(rows);
});

router.post('/', soloAdmin, async (req, res) => {
  const { nombre, anio, seccion, docente_id } = req.body;
  await pool.query(
    'INSERT INTO cursos (nombre,anio,seccion,docente_id) VALUES (?,?,?,?)',
    [nombre, anio, seccion, docente_id || null]
  );
  res.json({ ok: true });
});

router.delete('/:id', soloAdmin, async (req, res) => {
  await pool.query('DELETE FROM cursos WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;