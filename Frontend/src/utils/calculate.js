function hitungJumlahTugas(tugas) {
  return tugas.length;
}

function hitungTugasSelesai(tugas) {
  return tugas.filter(t => t.status === 'selesai').length;
}

function hitungPresentaseSelesai(tugas) {
  if (tugas.length === 0) return 0;
  return (hitungTugasSelesai(tugas) / tugas.length) * 100;
}

module.exports = { hitungJumlahTugas, hitungTugasSelesai, hitungPresentaseSelesai };