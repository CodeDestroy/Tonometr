const Sequilize = require('sequelize')

module.exports = new Sequilize('123', 'postgres', 'admin', {
    host: 'localhost',
    dialect: 'postgres' /* one of 'mysql' | | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
  });