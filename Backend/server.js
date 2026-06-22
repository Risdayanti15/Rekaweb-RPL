const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

// ✅ TAMBAHKAN BARIS INI: Agar server otomatis memicu koneksi database saat menyala
require('./config/config'); 

app.use(cors());
app.use(express.json());

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

// Untuk local - jalankan server
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
  });
}
