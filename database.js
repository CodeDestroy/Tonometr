const Sequilize = require('sequelize')

module.exports = new Sequilize('123', 'postgres', 'admin', {
    host: 'localhost',
    dialect: 'postgres' /* one of 'mysql' | | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });