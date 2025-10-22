// Aplikasi Absensi Guru Piket
class AbsensiApp {
    constructor() {
        this.init();
    }

    async init() {
        try {
            this.updateDate();
            await this.setupKelasDropdown();
            this.setupEventListeners();
            console.log('✅ Aplikasi absensi siap!');
        } catch (error) {
            console.error('❌ Gagal inisialisasi:', error);
        }
    }

    updateDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('id-ID', options);
        }
    }

    async setupKelasDropdown() {
        const select = document.getElementById('classSelect');
        if (!select) return;

        await loadAllData();
        
        select.innerHTML = '<option value="">-- Pilih Kelas --</option>';
        dataKelas.forEach(kelas => {
            const option = document.createElement('option');
            option.value = kelas.kode;
            option.textContent = kelas.nama;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        const classSelect = document.getElementById('classSelect');
        if (classSelect) {
            classSelect.addEventListener('change', (e) => {
                this.onKelasSelected(e.target.value);
            });
        }
    }

    async onKelasSelected(kelasKode) {
        if (!kelasKode) {
            this.hideAttendanceSection();
            return;
        }

        currentKelas = kelasKode;
        const siswa = getSiswaByKelas(kelasKode);
        const kelasInfo = getKelasInfo(kelasKode);

        studentStatus = {};
        studentNotes = {};
        currentStudents = siswa;

        this.updateClassInfo(kelasInfo, siswa.length);
        this.renderStudentList(siswa);
        this.updateSummary();
        this.showAttendanceSection();
    }

    updateClassInfo(kelasInfo, totalSiswa) {
        const classInfo = document.getElementById('classInfo');
        const className = document.getElementById('className');
        const totalStudents = document.getElementById('totalStudents');

        if (classInfo && className && totalStudents) {
            className.textContent = kelasInfo.nama;
            totalStudents.textContent = totalSiswa;
            classInfo.style.display = 'block';
        }
    }

    renderStudentList(siswa) {
        const container = document.getElementById('studentList');
        if (!container) return;

        container.innerHTML = '';

        siswa.forEach((student, index) => {
            const status = studentStatus[student.id] || 'H';
            const hasNote = studentNotes[student.id];

            const row = document.createElement('div');
            row.className = `student-row ${status !== 'H' ? status.toLowerCase() : ''}`;

            row.innerHTML = `
                <div class="col-no">${index + 1}</div>
                <div class="col-name">
                    ${student.nama}
                    ${hasNote ? '<span class="note-indicator">!</span>' : ''}
                </div>
                <div class="col-nis">${student.nis}</div>
                <div class="col-status">
                    <select class="status-select ${status !== 'H' ? status.toLowerCase() : ''}">
                        <option value="H" ${status === 'H' ? 'selected' : ''}>✅ Hadir</option>
                        <option value="T" ${status === 'T' ? 'selected' : ''}>❌ Tidak</option>
                        <option value="S" ${status === 'S' ? 'selected' : ''}>🤒 Sakit</option>
                        <option value="I" ${status === 'I' ? 'selected' : ''}>📄 Izin</option>
                    </select>
                </div>
                <div class="col-actions">
                    <button class="note-btn">${hasNote ? '✏️' : '📋'}</button>
                </div>
            `;

            // Tambahkan event listener untuk select
            const select = row.querySelector('select');
            select.addEventListener('change', (e) => {
                this.updateStudentStatus(student.id, e.target.value);
            });

            // Tambahkan event listener untuk tombol catatan
            const noteBtn = row.querySelector('.note-btn');
            noteBtn.addEventListener('click', () => {
                this.openNoteModal(student.id);
            });

            container.appendChild(row);
        });
    }

    updateStudentStatus(studentId, status) {
        studentStatus[studentId] = status;
        this.updateSummary();
        
        // Update styling
        const rows = document.querySelectorAll('.student-row');
        rows.forEach(row => {
            const select = row.querySelector('select');
            if (select) {
                const currentStatus = studentStatus[studentId];
                if (currentStatus) {
                    row.className = `student-row ${currentStatus !== 'H' ? currentStatus.toLowerCase() : ''}`;
                    select.className = `status-select ${currentStatus !== 'H' ? currentStatus.toLowerCase() : ''}`;
                }
            }
        });
    }

    updateSummary() {
        if (!currentStudents.length) return;

        const total = currentStudents.length;
        const present = currentStudents.filter(s => !studentStatus[s.id] || studentStatus[s.id] === 'H').length;
        const absent = currentStudents.filter(s => studentStatus[s.id] === 'T').length;
        const sick = currentStudents.filter(s => studentStatus[s.id] === 'S').length;
        const izin = currentStudents.filter(s => studentStatus[s.id] === 'I').length;

        const totalEl = document.getElementById('totalCount');
        const presentEl = document.getElementById('presentCount');
        const absentEl = document.getElementById('absentCount');
        const sickEl = document.getElementById('sickCount');
        const izinEl = document.getElementById('izinCount');

        if (totalEl) totalEl.textContent = total;
        if (presentEl) presentEl.textContent = present;
        if (absentEl) absentEl.textContent = absent;
        if (sickEl) sickEl.textContent = sick;
        if (izinEl) izinEl.textContent = izin;
    }

    openNoteModal(studentId) {
        selectedStudent = currentStudents.find(s => s.id === studentId);
        if (!selectedStudent) return;

        const modal = document.getElementById('noteModal');
        const studentInfo = document.getElementById('studentInfo');

        if (modal && studentInfo) {
            studentInfo.innerHTML = `
                <strong>${selectedStudent.nama}</strong><br>
                <small>NIS: ${selectedStudent.nis}</small>
            `;
            modal.style.display = 'block';
        }
    }

    closeNoteModal() {
        const modal = document.getElementById('noteModal');
        if (modal) modal.style.display = 'none';
        selectedStudent = null;
    }

    saveNote() {
        if (!selectedStudent) return;

        const type = document.getElementById('incidentType').value;
        const desc = document.getElementById('incidentDesc').value.trim();

        if (!type || !desc) {
            alert('Harap isi semua field!');
            return;
        }

        studentNotes[selectedStudent.id] = {
            type: type,
            description: desc,
            date: new Date().toLocaleDateString('id-ID')
        };

        alert('Catatan berhasil disimpan!');
        this.closeNoteModal();
        this.renderStudentList(currentStudents);
    }

    async simpanAbsensi() {
        if (!currentKelas) {
            alert('Pilih kelas terlebih dahulu!');
            return;
        }

        const siswaWithStatus = currentStudents.map(siswa => ({
            ...siswa,
            status: studentStatus[siswa.id] || 'H',
            keterangan: studentNotes[siswa.id] ? studentNotes[siswa.id].description : ''
        }));

        const total = currentStudents.length;
        const present = siswaWithStatus.filter(s => s.status === 'H').length;
        const absent = siswaWithStatus.filter(s => s.status === 'T').length;
        const sakit = siswaWithStatus.filter(s => s.status === 'S').length;
        const izin = siswaWithStatus.filter(s => s.status === 'I').length;

        try {
            // SIMPAN KE SERVER
            const payload = {
                action: 'simpan_absensi',
                tanggal: new Date().toISOString().split('T')[0],
                kelas: currentKelas,
                absensi_detail: siswaWithStatus,
                summary: {
                    total: total,
                    hadir: present,
                    tidak: absent,
                    sakit: sakit,
                    izin: izin
                }
            };

            console.log('📤 Mengirim data ke server:', payload);

            const response = await fetch(CONFIG.WEB_APP_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log('📥 Response dari server:', result);

            if (result.success) {
                alert(`✅ Absensi berhasil disimpan ke spreadsheet!\n\nKelas: ${currentKelas}\nTotal: ${total} siswa\nHadir: ${present} siswa`);
                
                // Buka spreadsheet untuk verifikasi
                console.log('📊 Data seharusnya sudah masuk ke spreadsheet');
            } else {
                throw new Error(result.error || 'Gagal menyimpan');
            }

        } catch (error) {
            console.error('❌ Gagal simpan ke server:', error);
            alert(`❌ Gagal menyimpan ke spreadsheet: ${error.message}\n\nCek Console (F12) untuk detail.`);
        }
    }

    resetAbsensi() {
        if (confirm('Yakin ingin mereset semua absensi?')) {
            studentStatus = {};
            studentNotes = {};
            this.renderStudentList(currentStudents);
            this.updateSummary();
        }
    }

    showAttendanceSection() {
        document.getElementById('attendanceSection').style.display = 'block';
        document.getElementById('actionSection').style.display = 'block';
    }

    hideAttendanceSection() {
        document.getElementById('attendanceSection').style.display = 'none';
        document.getElementById('actionSection').style.display = 'none';
        document.getElementById('classInfo').style.display = 'none';
    }
}

// Initialize app
let absensiApp;

document.addEventListener('DOMContentLoaded', function() {
    absensiApp = new AbsensiApp();
});

// Export functions untuk global access
window.simpanAbsensi = () => absensiApp?.simpanAbsensi();
window.resetAbsensi = () => absensiApp?.resetAbsensi();
window.closeNoteModal = () => absensiApp?.closeNoteModal();
window.saveNote = () => absensiApp?.saveNote();