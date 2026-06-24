const express = require('express');
const router = express.Router();
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// ============================================================
// MIDDLEWARE VERIFY TOKEN
// ============================================================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token tidak ada!' });

  try {
    // 💡 Gunakan fallback kunci rahasia cadangan agar verifikasi token tidak crash jika env kosong
    const secretKey = process.env.JWT_SECRET || 'KunciRahasiaCadanganIGNISBOT123!';
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: 'Token tidak valid!' });
  }
};

// ============================================================
// REGISTER
// ============================================================
router.post('/register',
  body('name')
    .trim()
    .escape()
    .notEmpty().withMessage('Nama wajib diisi!')
    .isLength({ min: 2, max: 100 }).withMessage('Nama minimal 2 karakter!'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi!')
    .isEmail().withMessage('Format email tidak valid!'),
  body('password')
    .trim()
    .notEmpty().withMessage('Password wajib diisi!')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter!'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Eror Validasi:", errors.array()); 
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email sudah terdaftar!' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword });

      // ⚡ Amankan jwt.sign dengan secret key cadangan murni
      const secretKey = process.env.JWT_SECRET || 'KunciRahasiaCadanganIGNISBOT123!';
      const token = jwt.sign(
        { id: user.id, email: user.email },
        secretKey,
        { expiresIn: process.env.JWT_EXPIRES || '1d' }
      );

      const { password: _, ...userData } = user.toJSON();

      res.status(201).json({
        message: 'Registrasi berhasil!',
        user: userData,
        token
      });

    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Gagal registrasi', error: error.message });
    }
  }
);

// ============================================================
// LOGIN
// ============================================================
router.post('/login',
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi!')
    .isEmail().withMessage('Format email tidak valid!'),
  body('password')
    .trim()
    .notEmpty().withMessage('Password wajib diisi!')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter!'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Email atau password salah!' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Email atau password salah!' });
      }

      // ⚡ Amankan jwt.sign dengan secret key cadangan murni agar bebas eror 500
      const secretKey = process.env.JWT_SECRET || 'KunciRahasiaCadanganIGNISBOT123!';
      const token = jwt.sign(
        { id: user.id, email: user.email },
        secretKey,
        { expiresIn: process.env.JWT_EXPIRES || '1d' }
      );

      const { password: _, ...userData } = user.toJSON();

      res.json({
        message: 'Login berhasil!',
        user: userData,
        token
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Gagal login', error: error.message });
    }
  }
);

// ============================================================
// GET DATA USER YANG SEDANG LOGIN
// ============================================================
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan!' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ message: 'Gagal ambil data user', error: error.message });
  }
});

// ============================================================
// UPDATE DATA USER YANG SEDANG LOGIN
// ============================================================
router.put('/me', verifyToken, async (req, res) => {
  try {
    const { name, username, phone, address, birthdate, gender } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan!' });
    }

    await user.update({
      name,
      username,
      phone,
      address,
      birthdate: birthdate || null,
      gender
    });

    const { password: _, ...userData } = user.toJSON();

    res.json({
      message: 'Profil berhasil diupdate!',
      user: userData
    });

  } catch (error) {
    console.error('Update profil error:', error);
    res.status(500).json({ message: 'Gagal update profil', error: error.message });
  }
});

module.exports = router;
