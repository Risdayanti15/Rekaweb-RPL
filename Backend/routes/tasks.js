const express = require('express'); // ← hapus tanda /////
const router = express.Router();

const { Task } = require('../models');


// ======================================
// GET semua tugas berdasarkan userId
// ======================================
router.get('/', async (req, res) => {

  try {

    const { userId } = req.query;

    const tasks = await Task.findAll({
      where: { userId },
      order: [['id', 'DESC']]
    });

    res.json(tasks);

  } catch (error) {

    res.status(500).json({
      message: 'Gagal ambil tugas',
      error
    });

  }

});


// ======================================
// POST tambah tugas
// ======================================
router.post('/', async (req, res) => {

  try {

    const {
      title,
      description,
      deadline,
      status,
      type,
      userId
    } = req.body;

    const task = await Task.create({
      title,
      description,
      deadline,
      status,
      type,
      userId
    });

    res.status(201).json({
      message: 'Tugas berhasil ditambahkan!',
      task
    });

  } catch (error) {

    res.status(500).json({
      message: 'Gagal tambah tugas',
      error
    });

  }

});


// ======================================
// PUT update tugas
// ======================================
router.put('/:id', async (req, res) => {

  try {

    const {
      title,
      description,
      deadline,
      status,
      type
    } = req.body;

    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: 'Tugas tidak ditemukan'
      });
    }

    await task.update({
      title,
      description,
      deadline,
      status,
      type
    });

    res.json({
      message: 'Tugas berhasil diupdate!',
      task
    });

  } catch (error) {

    res.status(500).json({
      message: 'Gagal update tugas',
      error
    });

  }

});


// ======================================
// DELETE hapus tugas
// ======================================
router.delete('/:id', async (req, res) => {

  try {

    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: 'Tugas tidak ditemukan'
      });
    }

    await task.destroy();

    res.json({
      message: 'Tugas berhasil dihapus!'
    });

  } catch (error) {

    res.status(500).json({
      message: 'Gagal hapus tugas',
      error
    });

  }

});


module.exports = router;