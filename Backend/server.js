const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

// 👑 1. PENGATURAN CORS (Wajib di Atas Sebelum Rute API)
app.use(cors({
    origin: "http://localhost:5173", // Mengizinkan frontend lokal Anda
    credentials: true,               // Wajib true jika frontend Anda mengirim token/cookie (withCredentials)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 📦 2. Middleware Parser JSON
app.use(express.json());

// 🗄️ 3. SINKRONISASI DATABASE (Menggunakan Sequelize ORM dari folder models)
const db = require('./models');
db.sequelize.sync()
  .then(() => console.log('⚡ Database Berhasil Sinkron via Sequelize ORM!'))
  .catch(err => console.error('❌ Gagal sinkronisasi database:', err.message));

// 🛣️ 4. DEKLARASI RUTE API
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const groupRoutes = require('./routes/groups');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/groups', groupRoutes);

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
