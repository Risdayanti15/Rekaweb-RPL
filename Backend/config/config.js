require('dotenv').config();

const dbConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306, // Akan otomatis membaca 27296 jika ada di Railway Variables
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
