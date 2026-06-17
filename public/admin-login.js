const adminLoginForm = document.getElementById('adminLoginForm');
const loginMessage = document.getElementById('loginMessage');

adminLoginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginMessage.textContent = 'Memproses login admin...';

  const payload = {
    username: document.getElementById('adminUsername').value.trim(),
    password: document.getElementById('adminPassword').value
  };

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      loginMessage.textContent = result.message || 'Login gagal.';
      return;
    }

    loginMessage.textContent = 'Login berhasil. Membuka panel admin...';
    window.location.href = result.redirect || '/panel-admin';
  } catch (error) {
    loginMessage.textContent = 'Tidak dapat terhubung ke server.';
  }
});
