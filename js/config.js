// Konfigurasi Aplikasi Absensi Digital SMK
const CONFIG = {
    // Password untuk login
    PASSWORD_PIKET: "piket2024",
    PASSWORD_KEPSEK: "kepsek2024",
    
    // URLs untuk data
    DATA_SISWA_URL: "https://smkn2lebong.sch.id/hadir/data/siswa.json",
    DATA_KELAS_URL: "https://smkn2lebong.sch.id/hadir/data/kelas.json",
    
    // Google Apps Script URL
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbzR9mLYpekhaRjmkTYBuuAlt3ZDW9693SXG7kQHwiqcqpm4MMQDBUITuLAaBh6BxY_N/exec"
};

// Variabel global
let currentUser = null;
let currentStudents = [];
let studentStatus = {};
let studentNotes = {};
let selectedStudent = null;
let currentKelas = null;
