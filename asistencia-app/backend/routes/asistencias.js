const router = require('express').Router();
const pool   = require('../config/db');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

// Listar asistencias por fecha / curso
router.get('/', async (req, res) => {
  const { fecha, curso_id } = req.query;
  let sql = `
    SELECT a.*, e.nombre, e.apellido, e.cedula
    FROM asistencias a
    JOIN estudiantes e ON e.id = a.estudiante_id
    WHERE 1=1`;
  const params = [];
  if (fecha)    { sql += ' AND a.fecha=?';    params.push(fecha); }
  if (curso_id) { sql += ' AND e.curso_id=?'; params.push(curso_id); }
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

// Guardar/masivo (upsert) por fecha
router.post('/', async (req, res) => {
  const { fecha, registros } = req.body;
  if (!fecha || !Array.isArray(registros))
    return res.status(400).json({ error: 'Datos inválidos' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const r of registros) {
      await conn.query(
        `INSERT INTO asistencias (estudiante_id, fecha, estado, observacion, registrado_por)
         VALUES (?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           estado = VALUES(estado),
           observacion = VALUES(observacion),
           registrado_por = VALUES(registrado_por)`,
        [r.estudiante_id, fecha, r.estado, r.observacion || null, req.usuario.id]
      );
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: 'Error al guardar asistencias' });
  } finally { conn.release(); }
});

// Resumen estadístico
router.get('/resumen', async (req, res) => {
  const { curso_id, desde, hasta } = req.query;
  let sql = `
    SELECT e.id, e.nombre, e.apellido, e.cedula,
      SUM(a.estado='presente')   AS presentes,
      SUM(a.estado='ausente')    AS ausentes,
      SUM(a.estado='tardanza')   AS tardanzas,
      SUM(a.estado='justificado')AS justificados,
      COUNT(a.id)                AS total
    FROM estudiantes e
    LEFT JOIN asistencias a ON a.estudiante_id=e.id
    WHERE e.activo=1`;
  const params = [];
  if (curso_id) { sql += ' AND e.curso_id=?'; params.push(curso_id); }
  if (desde)    { sql += ' AND a.fecha>=?';   params.push(desde); }
  if (hasta)    { sql += ' AND a.fecha<=?';   params.push(hasta); }
  sql += ' GROUP BY e.id ORDER BY e.apellido, e.nombre';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

module.exports = router;