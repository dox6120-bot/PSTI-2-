let rolSeleccionado = 'administrador';
document.querySelectorAll('.role-btn').forEach(b => {
  b.onclick = () => {
    document.querySelectorAll('.role-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    rolSeleccionado = b.dataset.rol;
  };
});

document.getElementById('form-login').onsubmit = async (e) => {
  e.preventDefault();
  const cedula   = document.getElementById('cedula').value.trim();
  const password = document.getElementById('password').value;
  const msg = document.getElementById('msg');
  msg.textContent = '';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cedula, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error');

    if (data.usuario.rol !== rolSeleccionado) {
      throw new Error('El rol seleccionado no coincide con su cuenta');
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    location.href = 'dashboard.html';
  } catch (err) {
    msg.style.color = '#e74c3c';
    msg.textContent = err.message;
  }
};