module.exports = {
  development: {
    username: "root",
    password: "",
    database: "sequelize_db",
    host: "127.0.0.1",
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    username: "root",
    password: "",
    database: "sequelize_db_test",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: "root",
    password: "",
    database: "sequelize_db_prod",
    host: "127.0.0.1",
    dialect: "mysql"
  }
};