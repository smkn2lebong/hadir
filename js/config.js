// Konfigurasi Aplikasi Absensi Digital SMK
const CONFIG = {
    // Password untuk login
    PASSWORD_PIKET: "piket2024",
    PASSWORD_KEPSEK: "kepsek2024",
    
    // URLs untuk data
    DATA_SISWA_URL: '../data/siswa.json',
    DATA_KELAS_URL: '../data/kelas.json',
    
    // Google Apps Script URL
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxaJlsavuEkPzCjQDll33Y7Mx7tazRiuk0jxIuO6jzKR0O5ksEHOAwJU-Zi0MOSRoxs/exec'
};

// Variabel global
let currentUser = null;
let currentStudents = [];
let studentStatus = {};
let studentNotes = {};
let selectedStudent = null;
let currentKelas = null;