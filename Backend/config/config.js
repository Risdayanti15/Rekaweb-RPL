require('dotenv').config();

const dbConfig = {
  // 🔗 Masing-masing baris ini akan otomatis mengambil data Aiven yang ada di Railway Variables
  username: process.env.DB_USER,      // Akan membaca 'avnadmin'
  password: process.env.DB_PASSWORD,  // Akan membaca 'AVNS_fVgef...'
  database: process.env.DB_NAME,      // Akan membaca 'defaultdb'
  host: process.env.DB_HOST,          // Akan membaca 'mysql-1a31a69d...'
  port: process.env.DB_PORT || 3306,  // Akan membaca '27296'
  dialect: 'mysql',
  dialectOptions: process.env.PORT ? {
    ssl: {
      rejectUnauthorized: false // Wajib aktif untuk jabat tangan aman dengan cloud Aiven
    }
  } : {}
};

module.exports = {
  development: dbConfig,
  test: dbConfig,
  production: dbConfig
};
