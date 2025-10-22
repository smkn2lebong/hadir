// Sistem Authentication
document.addEventListener('DOMContentLoaded', function() {
    // Role selection
    const roleButtons = document.querySelectorAll('.role-btn');
    roleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            roleButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
});

function handleLogin() {
    const password = document.getElementById('password').value;
    const activeRole = document.querySelector('.role-btn.active').dataset.role;

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
        alert('Password salah! Silakan coba lagi.');
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
        userInfo.textContent = currentUser === 'piket' ? 'Guru Piket' : 'Kepala Sekolah';
    }
}

function logout() {
    localStorage.removeItem('absensi_logged_in');
    localStorage.removeItem('absensi_user');
    window.location.href = 'index.html';
}

// Check auth saat page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
} else {
    checkAuth();
}