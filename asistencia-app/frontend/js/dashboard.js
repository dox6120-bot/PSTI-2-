const token   = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
if (!token || !usuario) location.href = 'index.html';

document.getElementById('user-info').textContent =
  `${usuario.nombre} ${usuario.apellido} (${usuario.rol})`;
document.getElementById('btn-salir').onclick = () => {
  localStorage.clear(); location.href = 'index.html';
};

async function api(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      ...(opts.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error');
  return data;
}

const contenido = document.getElementById('contenido');
const sidebar   = document.getElementById('sidebar');

/* ---------- MENÚS POR ROL ---------- */
const menus = {
  administrador: [
    { id: 'usuarios',    texto: '👥 Usuarios' },
    { id: 'cursos',      texto: '🎓 Cursos' },
    { id: 'estudiantes', texto: '🧑‍🎓 Estudiantes' },
    { id: 'reportes',    texto: '📊 Reportes' }
  ],
  personal: [
    { id: 'tomar',    texto: '✍️ Tomar asistencia' },
    { id: 'historial',texto: '📅 Historial' }
  ]
};

sidebar.innerHTML = menus[usuario.rol]
  .map((m, i) => `<a data-sec="${m.id}" class="${i===0?'active':''}">${m.texto}</a>`)
  .join('');

sidebar.querySelectorAll('a').forEach(a => {
  a.onclick = () => {
    sidebar.querySelectorAll('a').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
    render(a.dataset.sec);
  };
});

/* ---------- RENDERIZADORES ---------- */
function render(sec) {
  if (sec === 'usuarios')    return renderUsuarios();
  if (sec === 'cursos')      return renderCursos();
  if (sec === 'estudiantes') return renderEstudiantes();
  if (sec === 'reportes')    return renderReportes();
  if (sec === 'tomar')       return renderTomar();
  if (sec === 'historial')   return renderHistorial();
}

/* ---------- USUARIOS (ADMIN) ---------- */
async function renderUsuarios() {
  contenido.innerHTML = `<h3>Usuarios</h3>
    <div class="card"><form id="f-user" class="grid-form">
      <input id="u-cedula"  placeholder="Cédula" required>
      <input id="u-nombre"  placeholder="Nombre" required>
      <input id="u-apellido" placeholder="Apellido" required>
      <input id="u-email"   placeholder="Email" type="email" required>
      <input id="u-pass"    placeholder="Contraseña" required>
      <select id="u-rol">
        <option value="personal">Personal</option>
        <option value="administrador">Administrador</option>
      </select>
      <button>Agregar</button>
    </form></div>
    <div id="tabla-users"></div>`;

  const lista = await api('/api/usuarios');
  document.getElementById('tabla-users').innerHTML = `
    <table><tr><th>Cédula</th><th>Nombre</th><th>Rol</th><th>Estado</th></tr>
    ${lista.map(u => `<tr>
      <td>${u.cedula}</td><td>${u.nombre} ${u.apellido}</td>
      <td>${u.rol}</td><td>${u.activo ? 'Activo' : 'Inactivo'}</td>
    </tr>`).join('')}</table>`;

  document.getElementById('f-user').onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          cedula:   document.getElementById('u-cedula').value,
          nombre:   document.getElementById('u-nombre').value,
          apellido: document.getElementById('u-apellido').value,
          email:    document.getElementById('u-email').value,
          password: document.getElementById('u-pass').value,
          rol:      document.getElementById('u-rol').value
        })
      });
      renderUsuarios();
    } catch (err) { alert(err.message); }
  };
}

/* ---------- CURSOS ---------- */
async function renderCursos() {
  const users = await api('/api/usuarios').catch(() => []);
  const docs  = users.filter(u => u.rol === 'personal');
  contenido.innerHTML = `<h3>Cursos</h3>
    <div class="card"><form id="f-curso" class="grid-form">
      <input id="c-nombre"  placeholder="Nombre" required>
      <input id="c-anio"    placeholder="Año (1er,2do...)" required>
      <input id="c-seccion" placeholder="Sección" required>
      <select id="c-docente">
        <option value="">Sin docente</option>
        ${docs.map(d => `<option value="${d.id}">${d.nombre} ${d.apellido}</option>`).join('')}
      </select>
      <button>Agregar</button>
    </form></div>
    <div id="tabla-cursos"></div>`;

  const lista = await api('/api/cursos');
  document.getElementById('tabla-cursos').innerHTML = `
    <table><tr><th>Año</th><th>Sección</th><th>Nombre</th><th>Docente</th></tr>
    ${lista.map(c => `<tr>
      <td>${c.anio}</td><td>${c.seccion}</td><td>${c.nombre}</td>
      <td>${c.docente_nombre ? c.docente_nombre + ' ' + c.docente_apellido : '—'}</td>
    </tr>`).join('')}</table>`;

  document.getElementById('f-curso').onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api('/api/cursos', {
        method: 'POST',
        body: JSON.stringify({
          nombre:  document.getElementById('c-nombre').value,
          anio:    document.getElementById('c-anio').value,
          seccion: document.getElementById('c-seccion').value,
          docente_id: document.getElementById('c-docente').value || null
        })
      });
      renderCursos();
    } catch (err) { alert(err.message); }
  };
}

/* ---------- ESTUDIANTES ---------- */
async function renderEstudiantes() {
  const cursos = await api('/api/cursos');
  contenido.innerHTML = `<h3>Estudiantes</h3>
    <div class="card"><form id="f-est" class="grid-form">
      <input id="e-cedula" placeholder="Cédula" required>
      <input id="e-nombre" placeholder="Nombre" required>
      <input id="e-apellido" placeholder="Apellido" required>
      <input id="e-rep" placeholder="Representante">
      <input id="e-tel" placeholder="Teléfono">
      <select id="e-curso">
        ${cursos.map(c => `<option value="${c.id}">${c.anio} ${c.seccion} – ${c.nombre}</option>`).join('')}
      </select>
      <button>Agregar</button>
    </form></div>
    <div id="tabla-est"></div>`;

  const lista = await api('/api/estudiantes');
  document.getElementById('tabla-est').innerHTML = `
    <table><tr><th>Cédula</th><th>Nombre</th><th>Curso</th><th>Representante</th></tr>
    ${lista.map(e => `<tr>
      <td>${e.cedula}</td><td>${e.nombre} ${e.apellido}</td>
      <td>${e.anio || ''} ${e.seccion || ''}</td>
      <td>${e.representante || '—'}</td>
    </tr>`).join('')}</table>`;

  document.getElementById('f-est').onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api('/api/estudiantes', {
        method: 'POST',
        body: JSON.stringify({
          cedula:   document.getElementById('e-cedula').value,
          nombre:   document.getElementById('e-nombre').value,
          apellido: document.getElementById('e-apellido').value,
          representante: document.getElementById('e-rep').value || null,
          telefono: document.getElementById('e-tel').value || null,
          curso_id: document.getElementById('e-curso').value
        })
      });
      renderEstudiantes();
    } catch (err) { alert(err.message); }
  };
}

/* ---------- REPORTES (ADMIN) ---------- */
async function renderReportes() {
  const cursos = await api('/api/cursos');
  contenido.innerHTML = `<h3>Reportes de asistencia</h3>
    <div class="card grid-form">
      <select id="r-curso">
        <option value="">Todos los cursos</option>
        ${cursos.map(c => `<option value="${c.id}">${c.anio} ${c.seccion}</option>`).join('')}
      </select>
      <input type="date" id="r-desde">
      <input type="date" id="r-hasta">
      <button id="r-btn">Filtrar</button>
    </div>
    <div id="r-tabla"></div>`;

  document.getElementById('r-btn').onclick = async () => {
    const curso = document.getElementById('r-curso').value;
    const desde = document.getElementById('r-desde').value;
    const hasta = document.getElementById('r-hasta').value;
    const qs = new URLSearchParams();
    if (curso) qs.append('curso_id', curso);
    if (desde) qs.append('desde', desde);
    if (hasta) qs.append('hasta', hasta);

    const data = await api('/api/asistencias/resumen?' + qs);
    document.getElementById('r-tabla').innerHTML = `
      <table><tr>
        <th>Estudiante</th><th>Presentes</th><th>Ausentes</th>
        <th>Tardanzas</th><th>Justificados</th><th>Total</th>
      </tr>${data.map(d => `<tr>
        <td>${d.nombre} ${d.apellido}</td>
        <td>${d.presentes}</td><td>${d.ausentes}</td>
        <td>${d.tardanzas}</td><td>${d.justificados}</td><td>${d.total}</td>
      </tr>`).join('')}</table>`;
  };
}

/* ---------- TOMAR ASISTENCIA (PERSONAL) ---------- */
async function renderTomar() {
  const cursos = await api('/api/cursos');
  const hoy = new Date().toISOString().slice(0, 10);
  contenido.innerHTML = `<h3>Tomar asistencia</h3>
    <div class="card grid-form">
      <select id="t-curso">
        ${cursos.map(c => `<option value="${c.id}">${c.anio} ${c.seccion}</option>`).join('')}
      </select>
      <input type="date" id="t-fecha" value="${hoy}">
      <button id="t-cargar">Cargar lista</button>
    </div>
    <div id="t-lista"></div>`;

  document.getElementById('t-cargar').onclick = cargarLista;
  cargarLista();

  async function cargarLista() {
    const curso = document.getElementById('t-curso').value;
    const fecha = document.getElementById('t-fecha').value;
    const [est, asist] = await Promise.all([
      api('/api/estudiantes?curso_id=' + curso),
      api('/api/asistencias?fecha=' + fecha + '&curso_id=' + curso)
    ]);
    const mapa = {};
    asist.forEach(a => mapa[a.estudiante_id] = a.estado);

    document.getElementById('t-lista').innerHTML = `
      <table><tr><th>Estudiante</th><th>Estado</th></tr>
      ${est.map(e => `<tr class="asistencia-row">
        <td>${e.apellido}, ${e.nombre}</td>
        <td><select data-id="${e.id}">
          ${['presente','ausente','tardanza','justificado'].map(x =>
            `<option value="${x}" ${mapa[e.id]===x?'selected':''}>${x}</option>`).join('')}
        </select></td>
      </tr>`).join('')}</table>
      <button class="btn-guardar" id="t-guardar">💾 Guardar asistencia</button>`;

    document.getElementById('t-guardar').onclick = async () => {
      const registros = [...document.querySelectorAll('.asistencia-row select')]
        .map(s => ({ estudiante_id: +s.dataset.id, estado: s.value }));
      try {
        await api('/api/asistencias', {
          method: 'POST',
          body: JSON.stringify({ fecha, registros })
        });
        alert('✅ Asistencia guardada correctamente');
      } catch (err) { alert(err.message); }
    };
  }
}

/* ---------- HISTORIAL (PERSONAL) ---------- */
async function renderHistorial() {
  const hoy = new Date().toISOString().slice(0, 10);
  contenido.innerHTML = `<h3>Historial de asistencias</h3>
    <div class="card grid-form">
      <input type="date" id="h-fecha" value="${hoy}">
      <button id="h-btn">Buscar</button>
    </div><div id="h-tabla"></div>`;

  const buscar = async () => {
    const fecha = document.getElementById('h-fecha').value;
    const data = await api('/api/asistencias?fecha=' + fecha);
    document.getElementById('h-tabla').innerHTML = `
      <table><tr><th>Estudiante</th><th>Cédula</th><th>Estado</th></tr>
      ${data.map(a => `<tr>
        <td>${a.apellido}, ${a.nombre}</td>
        <td>${a.cedula}</td>
        <td><span class="tag ${a.estado}">${a.estado}</span></td>
      </tr>`).join('')}</table>`;
  };
  document.getElementById('h-btn').onclick = buscar;
  buscar();
}

/* ---------- ARRANQUE ---------- */
render(menus[usuario.rol][0].id);