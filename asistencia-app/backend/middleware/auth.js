const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const h = req.headers['authorization'] || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

function soloAdmin(req, res, next) {
  if (req.usuario.rol !== 'administrador')
    return res.status(403).json({ error: 'Solo el administrador puede hacer esto' });
  next();
}

module.exports = { verificarToken, soloAdmin };