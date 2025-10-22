// Data Loader
let dataSiswa = null;
let dataKelas = null;

async function loadAllData() {
    try {
        const [siswa, kelas] = await Promise.all([
            loadSiswa(),
            loadKelas()
        ]);
        return { siswa, kelas };
    } catch (error) {
        console.error('Gagal memuat data:', error);
        throw error;
    }
}

async function loadSiswa() {
    if (dataSiswa) return dataSiswa;

    try {
        const response = await fetch(CONFIG.DATA_SISWA_URL);
        const data = await response.json();
        dataSiswa = data.siswa || [];
        return dataSiswa;
    } catch (error) {
        console.error('Error loading siswa:', error);
        return [];
    }
}

async function loadKelas() {
    if (dataKelas) return dataKelas;

    try {
        const response = await fetch(CONFIG.DATA_KELAS_URL);
        const data = await response.json();
        dataKelas = data.kelas || [];
        return dataKelas;
    } catch (error) {
        console.error('Error loading kelas:', error);
        return [];
    }
}

function getSiswaByKelas(kelasKode) {
    if (!dataSiswa) return [];
    return dataSiswa.filter(siswa => siswa.kelas === kelasKode);
}

function getKelasInfo(kelasKode) {
    if (!dataKelas) return null;
    return dataKelas.find(kelas => kelas.kode === kelasKode);
}