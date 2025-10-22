// Monitoring untuk Kepala Sekolah - DENGAN DETAIL SISWA (FILE LENGKAP)

// Initialize monitoring
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Monitoring Kepsek Dimulai...');
    initializeMonitoring();
});

async function initializeMonitoring() {
    try {
        updateDate();
        setupMonitoringEvents();
        await loadRealData();
        console.log('✅ Monitoring siap dengan data real');
    } catch (error) {
        console.error('❌ Gagal inisialisasi monitoring:', error);
    }
}

function updateDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateString = now.toLocaleDateString('id-ID', options);
    
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = dateString;
    }
    
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.value = new Date().toISOString().split('T')[0];
        updateSelectedDate();
    }
}

function setupMonitoringEvents() {
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            updateSelectedDate();
            loadRealData();
        });
    }
}

function updateSelectedDate() {
    const dateFilter = document.getElementById('dateFilter');
    const selectedDate = document.getElementById('selectedDate');
    
    if (dateFilter && selectedDate) {
        const date = new Date(dateFilter.value);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        selectedDate.textContent = date.toLocaleDateString('id-ID', options);
    }
}

// Load data REAL dari localStorage
async function loadRealData() {
    try {
        showLoading();
        
        const dateFilter = document.getElementById('dateFilter');
        const selectedDate = dateFilter ? dateFilter.value : new Date().toISOString().split('T')[0];
        
        console.log('📅 Loading data untuk tanggal:', selectedDate);
        
        const absensiData = getAbsensiByDate(selectedDate);
        
        if (absensiData.length === 0) {
            showDefaultData(selectedDate);
        } else {
            showRealData(absensiData, selectedDate);
        }
        
        hideLoading();
        
    } catch (error) {
        console.error('Error loading real data:', error);
        hideLoading();
    }
}

// Ambil data absensi berdasarkan tanggal dari localStorage
function getAbsensiByDate(tanggal) {
    const absensiData = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith(`absensi_${tanggal}_`)) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                absensiData.push(data);
            } catch (e) {
                console.error('Error parsing data:', key, e);
            }
        }
    }
    
    console.log(`📈 Total absensi ditemukan: ${absensiData.length} untuk tanggal ${tanggal}`);
    return absensiData;
}

// Tampilkan data REAL dari absensi
function showRealData(absensiData, tanggal) {
    let totalSiswa = 0;
    let totalHadir = 0;
    let totalTidak = 0;
    let totalSakit = 0;
    let totalIzin = 0;
    
    const kelasData = [];
    const detailSiswa = []; // Untuk menyimpan detail per siswa
    
    // Process each class data
    absensiData.forEach(data => {
        const summary = data.summary;
        
        totalSiswa += summary.total;
        totalHadir += summary.hadir;
        totalTidak += summary.tidak;
        totalSakit += summary.sakit;
        totalIzin += summary.izin;
        
        console.log(`📊 Data kelas ${data.kelas}:`, {
            total: summary.total,
            tidakHadir: summary.tidak,
            data: data.data
        });
        
        // Simpan detail siswa yang tidak hadir/sakit/izin ATAU punya catatan
        data.data.forEach(siswa => {
            if (siswa.status !== 'H' || siswa.catatan) {
                console.log(`👤 ${siswa.nama}:`, {
                    status: siswa.status,
                    catatan: siswa.catatan,
                    keterangan: siswa.keterangan
                });
                
                detailSiswa.push({
                    nama: siswa.nama,
                    nis: siswa.nis,
                    kelas: getKelasDisplayName(data.kelas),
                    status: getStatusDisplay(siswa.status),
                    keterangan: siswa.keterangan || '-',
                    catatan: siswa.catatan || '-'
                });
            }
        });
        
        const kelasInfo = getKelasDisplayName(data.kelas);
        const persentase = Math.round((summary.hadir / summary.total) * 100);
        
        kelasData.push({
            kelas: kelasInfo,
            total: summary.total,
            hadir: summary.hadir,
            tidak: summary.tidak,
            sakit: summary.sakit,
            izin: summary.izin,
            persentase: `${persentase}%`,
            kode: data.kelas
        });
    });
    
    if (kelasData.length === 0) {
        showDefaultData(tanggal);
        return;
    }
    
    const totalPersentase = totalSiswa > 0 ? Math.round((totalHadir / totalSiswa) * 100) : 0;
    
    updateStats({
        totalSiswa: totalSiswa,
        totalHadir: totalHadir,
        totalTidak: totalTidak,
        totalSakit: totalSakit,
        totalIzin: totalIzin,
        persentase: `${totalPersentase}%`
    });
    
    updateClassTable(kelasData);
    updateDetailSiswaTable(detailSiswa);
    
    console.log('📊 Data real ditampilkan:', {
        totalSiswa,
        totalHadir, 
        totalTidak,
        detailSiswa: detailSiswa.length,
        detailData: detailSiswa
    });
}

// Tampilkan data DEFAULT (ketika belum ada absensi)
function showDefaultData(tanggal) {
    console.log('📝 Menampilkan data default (belum ada absensi)');
    
    const totalSiswa = getTotalSiswaFromMaster();
    const totalHadir = totalSiswa;
    const totalPersentase = 100;
    
    const kelasData = generateDefaultKelasData();
    
    updateStats({
        totalSiswa: totalSiswa,
        totalHadir: totalHadir,
        totalTidak: 0,
        totalSakit: 0,
        totalIzin: 0,
        persentase: `${totalPersentase}%`
    });
    
    updateClassTable(kelasData);
    
    // Kosongkan detail siswa karena belum ada absensi
    updateDetailSiswaTable([]);
    
    const selectedDate = document.getElementById('selectedDate');
    if (selectedDate) {
        selectedDate.innerHTML += ' <span style="color:#e74c3c; font-size:12px;">(Belum ada absensi)</span>';
    }
}

// Tampilkan DETAIL SISWA yang tidak hadir/sakit/izin
function updateDetailSiswaTable(detailSiswa) {
    // Cari atau buat section untuk detail siswa
    let detailSection = document.getElementById('detailSiswaSection');
    
    if (!detailSection) {
        // Buat section baru jika belum ada
        detailSection = document.createElement('div');
        detailSection.id = 'detailSiswaSection';
        detailSection.className = 'detail-section';
        detailSection.innerHTML = `
            <h3>📋 Detail Siswa Tidak Hadir / Sakit / Izin / Berkas Catatan</h3>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Siswa</th>
                            <th>NIS</th>
                            <th>Kelas</th>
                            <th>Status</th>
                            <th>Keterangan</th>
                            <th>Catatan Kejadian</th>
                        </tr>
                    </thead>
                    <tbody id="detailSiswaBody">
                    </tbody>
                </table>
            </div>
            <div id="noDetailData" style="text-align: center; padding: 20px; color: #7f8c8d; display: none;">
                ✅ Semua siswa hadir dan tidak ada catatan
            </div>
        `;
        
        // Sisipkan setelah table section
        const tableSection = document.querySelector('.table-section');
        if (tableSection) {
            tableSection.parentNode.insertBefore(detailSection, tableSection.nextSibling);
        }
    }
    
    const tbody = document.getElementById('detailSiswaBody');
    const noDataMsg = document.getElementById('noDetailData');
    
    if (!tbody || !noDataMsg) return;
    
    tbody.innerHTML = '';
    
    if (detailSiswa.length === 0) {
        tbody.style.display = 'none';
        noDataMsg.style.display = 'block';
    } else {
        tbody.style.display = 'table-row-group';
        noDataMsg.style.display = 'none';
        
        detailSiswa.forEach((siswa, index) => {
            const row = document.createElement('tr');
            
            // Highlight baris yang punya catatan
            const hasCatatan = siswa.catatan && siswa.catatan !== '-';
            if (hasCatatan) {
                row.style.backgroundColor = '#fff3cd';
            }
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${siswa.nama}</strong></td>
                <td>${siswa.nis}</td>
                <td>${siswa.kelas}</td>
                <td>
                    <span class="status-badge ${getStatusClass(siswa.status)}">
                        ${siswa.status}
                    </span>
                </td>
                <td>${siswa.keterangan}</td>
                <td>${hasCatatan ? '📝 ' + siswa.catatan : '-'}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Helper function untuk display status
function getStatusDisplay(status) {
    const statusMap = {
        'H': 'Hadir',
        'T': 'Tidak Hadir',
        'S': 'Sakit', 
        'I': 'Izin'
    };
    return statusMap[status] || status;
}

// Helper function untuk class CSS status
function getStatusClass(status) {
    const statusText = getStatusDisplay(status);
    const classMap = {
        'Hadir': 'status-hadir',
        'Tidak Hadir': 'status-tidak',
        'Sakit': 'status-sakit',
        'Izin': 'status-izin'
    };
    return classMap[statusText] || '';
}

// Ambil total siswa dari data master
function getTotalSiswaFromMaster() {
    try {
        if (window.dataLoader && dataLoader.dataSiswa) {
            return dataLoader.dataSiswa.length;
        }
        return 354; // Default total siswa dari data Anda
    } catch (error) {
        return 354;
    }
}

// Generate data kelas default dari data master
function generateDefaultKelasData() {
    const defaultData = [
        { kelas: '10 TATA BUSANA', total: 25, hadir: 25, tidak: 0, sakit: 0, izin: 0, persentase: '100%' },
        { kelas: '10 DKV', total: 36, hadir: 36, tidak: 0, sakit: 0, izin: 0, persentase: '100%' },
        { kelas: '10 LISTRIK', total: 36, hadir: 36, tidak: 0, sakit: 0, izin: 0, persentase: '100%' },
        { kelas: '10 TKR', total: 36, hadir: 36, tidak: 0, sakit: 0, izin: 0, persentase: '100%' },
        { kelas: '10 TSM', total: 36, hadir: 36, tidak: 0, sakit: 0, izin: 0, persentase: '100%' },
        { kelas: '11 DKV', total: 32, hadir: 32, tidak: 0, sakit: 0, izin: 0, persentase: '100%' },
        { kelas: '11 TKR', total: 35, hadir: 35, tidak: 0, sakit: 0, izin: 0, persentase: '100%' },
        { kelas: '11 TSM', total: 34, hadir: 34, tidak: 0, sakit: 0, izin: 0, persentase: '100%' },
        { kelas: '12 MULTIMEDIA', total: 28, hadir: 28, tidak: 0, sakit: 0, izin: 0, persentase: '100%' },
        { kelas: '12 TATA BUSANA', total: 24, hadir: 24, tidak: 0, sakit: 0, izin: 0, persentase: '100%' }
    ];
    
    return defaultData;
}

// Helper function untuk format nama kelas
function getKelasDisplayName(kelasKode) {
    const kelasMapping = {
        '10_tata_busana': '10 TATA BUSANA',
        '10_dkv': '10 DKV',
        '10_listrik': '10 LISTRIK',
        '10_tkr': '10 TKR',
        '10_tsm': '10 TSM',
        '11_dkv': '11 DKV',
        '11_tkr': '11 TKR',
        '11_tsm': '11 TSM',
        '12_multimedia': '12 MULTIMEDIA',
        '12_tata_busana': '12 TATA BUSANA',
        '12_tbsm': '12 TBSM',
        '12_titl': '12 TITL',
        '12_tkro': '12 TKRO'
    };
    
    return kelasMapping[kelasKode] || kelasKode;
}

function updateStats(data) {
    const totalSiswaElem = document.getElementById('totalSiswa');
    const totalHadirElem = document.getElementById('totalHadir');
    const totalTidakElem = document.getElementById('totalTidak');
    const totalSakitElem = document.getElementById('totalSakit');
    const totalIzinElem = document.getElementById('totalIzin');
    const persentaseElem = document.getElementById('persentase');
    
    if (totalSiswaElem) totalSiswaElem.textContent = data.totalSiswa;
    if (totalHadirElem) totalHadirElem.textContent = data.totalHadir;
    if (totalTidakElem) totalTidakElem.textContent = data.totalTidak;
    if (totalSakitElem) totalSakitElem.textContent = data.totalSakit;
    if (totalIzinElem) totalIzinElem.textContent = data.totalIzin;
    if (persentaseElem) persentaseElem.textContent = data.persentase;
}

function updateClassTable(kelasData) {
    const tbody = document.getElementById('classTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    kelasData.forEach(kelas => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${kelas.kelas}</td>
            <td>${kelas.total}</td>
            <td>${kelas.hadir}</td>
            <td>${kelas.tidak}</td>
            <td>${kelas.sakit}</td>
            <td>${kelas.izin}</td>
            <td><strong>${kelas.persentase}</strong></td>
        `;
        tbody.appendChild(row);
    });
}

function loadData() {
    loadRealData();
}

function exportExcel() {
    // Collect data for export
    const dateFilter = document.getElementById('dateFilter');
    const selectedDate = dateFilter ? dateFilter.value : new Date().toISOString().split('T')[0];
    const absensiData = getAbsensiByDate(selectedDate);
    
    if (absensiData.length === 0) {
        alert('❌ Tidak ada data absensi untuk diexport pada tanggal ' + selectedDate);
        return;
    }
    
    let csvContent = "LAPORAN ABSENSI - " + selectedDate + "\n\n";
    
    // Summary
    csvContent += "STATISTIK KESELURUHAN\n";
    csvContent += "Total Siswa,Hadir,Tidak Hadir,Sakit,Izin,Persentase\n";
    
    let totalSiswa = 0, totalHadir = 0, totalTidak = 0, totalSakit = 0, totalIzin = 0;
    
    absensiData.forEach(data => {
        totalSiswa += data.summary.total;
        totalHadir += data.summary.hadir;
        totalTidak += data.summary.tidak;
        totalSakit += data.summary.sakit;
        totalIzin += data.summary.izin;
    });
    
    const persentase = totalSiswa > 0 ? Math.round((totalHadir / totalSiswa) * 100) : 0;
    csvContent += `${totalSiswa},${totalHadir},${totalTidak},${totalSakit},${totalIzin},${persentase}%\n\n`;
    
    // Detail per kelas
    csvContent += "REKAP PER KELAS\n";
    csvContent += "Kelas,Total,Hadir,Tidak Hadir,Sakit,Izin,Persentase\n";
    
    absensiData.forEach(data => {
        const kelasInfo = getKelasDisplayName(data.kelas);
        const persentase = Math.round((data.summary.hadir / data.summary.total) * 100);
        csvContent += `${kelasInfo},${data.summary.total},${data.summary.hadir},${data.summary.tidak},${data.summary.sakit},${data.summary.izin},${persentase}%\n`;
    });
    
    csvContent += "\nDETAIL SISWA TIDAK HADIR/SAKIT/IZIN/BERKAS CATATAN\n";
    csvContent += "No,Nama Siswa,NIS,Kelas,Status,Keterangan,Catatan Kejadian\n";
    
    let detailCount = 0;
    absensiData.forEach(data => {
        data.data.forEach(siswa => {
            if (siswa.status !== 'H' || siswa.catatan) {
                detailCount++;
                const statusDisplay = getStatusDisplay(siswa.status);
                const kelasInfo = getKelasDisplayName(data.kelas);
                csvContent += `${detailCount},${siswa.nama},${siswa.nis},${kelasInfo},${statusDisplay},${siswa.keterangan || '-'},${siswa.catatan || '-'}\n`;
            }
        });
    });
    
    if (detailCount === 0) {
        csvContent += "0,Semua siswa hadir dan tidak ada catatan,-,-,-,-,-\n";
    }
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_absensi_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`📊 Laporan berhasil diexport!\nFile: laporan_absensi_${selectedDate}.csv`);
}

function showRekapBulanan() {
    alert('📈 Fitur rekap bulanan akan tersedia setelah terhubung dengan Google Apps Script');
}

function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'block';
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
}