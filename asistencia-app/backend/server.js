require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/usuarios',     require('./routes/usuarios'));
app.use('/api/cursos',       require('./routes/cursos'));
app.use('/api/estudiantes',  require('./routes/estudiantes'));
app.use('/api/asistencias',  require('./routes/asistencias'));

app.get('/', (_req, res) => res.json({ ok: true, app: 'U.E. José María Barroeta Paolini' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend en http://localhost:${PORT}`));