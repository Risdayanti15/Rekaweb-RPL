const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

// 👑 1. PENGATURAN CORS (Wajib di Atas Sebelum Rute API)
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://127.0.0.1:5173', 
        'https://rekaweb-rpl.vercel.app' // Mengizinkan domain produksi frontend Vercel kamu
    ], 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 📦 2. Middleware Parser JSON
app.use(express.json());

// 🗄️ 3. SINKRONISASI DATABASE 
const db = require('./models');

// ⚡ SEMENTARA MENGGUNAKAN { force: true } UNTUK MEMBERSIHKAN TABEL DAN STRUKTUR ENKRIPSI YANG KORUP
db.sequelize.sync({ alter: true }) 
  .then(() => console.log('⚡ Database Berhasil Sinkron & Tabel Dibersihkan Total via Sequelize!'))
  .catch(err => console.error('❌ Gagal sinkronisasi database:', err.message));

// 🛣️ 4. DEKLARASI RUTE API
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const groupRoutes = require('./routes/groups');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/groups', groupRoutes);

// Jalur pengetesan kesehatan server (Health Check)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Untuk Vercel - export app
module.exports = app;

// Untuk local & Railway - jalankan server
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
  });
}
