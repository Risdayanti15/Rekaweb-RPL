const express = require('express');
const router = express.Router();
const { Group } = require('../models');

// GET semua kelompok by userId
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const groups = await Group.findAll({ where: { memberId: userId } });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil kelompok', error });
  }
});

// POST tambah kelompok baru
router.post('/', async (req, res) => {
  try {
    const { memberId, nama, deskripsi, matkul, anggota, status } = req.body;
    const group = await Group.create({ memberId, nama, deskripsi, matkul, anggota, status });
    res.status(201).json({ message: 'Kelompok berhasil ditambahkan!', group });
  } catch (error) {
    res.status(500).json({ message: 'Gagal tambah kelompok', error });
  }
});

// PUT update kelompok
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi, matkul, anggota, status } = req.body;

    const group = await Group.findByPk(id);
    if (!group) {
      return res.status(404).json({ message: 'Kelompok tidak ditemukan' });
    }

    await group.update({ nama, deskripsi, matkul, anggota, status });
    res.json({ message: 'Kelompok berhasil diperbarui!', group });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui kelompok', error });
  }
});

// DELETE hapus kelompok
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findByPk(id);
    if (!group) {
      return res.status(404).json({ message: 'Kelompok tidak ditemukan' });
    }

    await group.destroy();
    res.json({ message: 'Kelompok berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus kelompok', error });
  }
});

module.exports = router;