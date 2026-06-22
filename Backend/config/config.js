require('dotenv').config();

const dbConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  // ⚡ WAJIB: Gunakan parseInt agar port '27296' dibaca sebagai angka murni, bukan teks string
  port: parseInt(process.env.DB_PORT, 10) || 3306, 
  dialect: 'mysql',
  dialectOptions: process.env.PORT ? {
    ssl: {
      rejectUnauthorized: false
    }
  } : {}
};

module.exports = {
  development: dbConfig,
  test: dbConfig,
  production: dbConfig
};
