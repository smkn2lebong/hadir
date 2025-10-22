// ==================================================
// 🔐 Sistem Authentication Absensi SMKN 2 Lebong
// ==================================================

document.addEventListener('DOMContentLoaded', () => {
  // Role selection (Piket / Kepala Sekolah)
  const roleButtons = document.querySelectorAll('.role-btn');
  roleButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      roleButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Login form submit
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      handleLogin();
    });
  }

  // Jalankan auth check pada semua halaman
  checkAuth();
});

let currentUser = null;

function handleLogin() {
  const passwordInput = document.getElementById('password');
  const password = passwordInput ? passwordInput.value.trim() : '';
  const activeRoleBtn = document.querySelector('.role-btn.active');

  if (!activeRoleBtn) {
    alert('Silakan pilih peran terlebih dahulu (Piket atau Kepala Sekolah).');
    return;
  }

  const activeRole = activeRoleBtn.dataset.role;

  let isValid = false;
  let redirectPage = '';

  if (activeRole === 'piket' && password === CONFIG.PASSWORD_PIKET) {
    isValid = true;
    redirectPage = 'piket.html';
    currentUser = 'piket';
  } else if (activeRole === 'kepsek' && password === CONFIG.PASSWORD_KEPSEK) {
    isValid = true;
    redirectPage = 'kepsek.html';
    currentUser = 'kepsek';
  }

  if (isValid) {
    localStorage.setItem('absensi_user', currentUser);
    localStorage.setItem('absensi_logged_in', 'true');
    window.location.href = redirectPage;
  } else {
    alert('⚠️ Password salah! Silakan coba lagi.');
    passwordInput.value = '';
    passwordInput.focus();
  }
}

function checkAuth() {
  const isLoggedIn = localStorage.getItem('absensi_logged_in');
  const currentPage = window.location.pathname.split('/').pop();

  if (!isLoggedIn && currentPage !== 'index.html') {
    window.location.href = 'index.html';
    return;
  }

  if (isLoggedIn) {
    currentUser = localStorage.getItem('absensi_user');
    updateUserInfo();
  }
}

function updateUserInfo() {
  const userInfo = document.getElementById('userInfo');
  if (userInfo) {
    if (currentUser === 'piket') {
      userInfo.textContent = '👩‍🏫 Guru Piket';
    } else if (currentUser === 'kepsek') {
      userInfo.textContent = '👨‍💼 Kepala Sekolah';
    } else {
      userInfo.textContent = 'Pengguna Tidak Dikenal';
    }
  }
}

function logout() {
  localStorage.removeItem('absensi_logged_in');
  localStorage.removeItem('absensi_user');
  window.location.href = 'index.html';
}
