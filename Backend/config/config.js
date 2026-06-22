const mysql = require('mysql2');
require('dotenv').config();

let db_config;

// 🚀 Deteksi Otomatis: Jika ada variabel PORT, berarti berjalan di Railway (Production)
if (process.env.PORT) {
    db_config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        // 🔥 Tambahkan SSL agar jabat tangan jaringan dengan database cloud aman
        ssl: {
            rejectUnauthorized: false
        }
    };
} else {
    // 💻 Jika tidak ada PORT, berarti berjalan di Laptop ThinkPad (Localhost)
    db_config = {
        host: 'localhost',
        user: 'root',
        password: '', // isi jika phpMyAdmin lokalmu menggunakan password
        database: 'db_rekaweb_rpl' // 💡 Sesuaikan dengan nama database lokalmu di phpMyAdmin
    };
}

const db = mysql.createConnection(db_config);

db.connect((err) => {
    if (err) {
        console.error('❌ Gagal menyambung ke database:', err.message);
    } else {
        console.log('⚡ Database Berhasil Terhubung ke Server Rekaweb-RPL!');
    }
});

module.exports = db;
