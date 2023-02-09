const { Model } = require('sequelize');
const {Sequelize} = require('sequelize')
const sequelize = require("../database")

class MonitoringTon extends Model {}
MonitoringTon.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  dt_change: {
    type: Sequelize.TIME,
    allowNull: true
  },
  is_del: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  dt_dimension: {
    type: Sequelize.TIME,
    allowNull: true
  },
  upper_pressure: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  lower_pressure: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  heart_rate: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  apointment_id: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  reaction: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  measurement_comment: {
    type: Sequelize.STRING,
    allowNull: true
  },
}, {
  sequelize,
  modelName: "MonitoringTon",
  tableName: 'monitoring_ton',
  timestamps: false,
});

module.exports = MonitoringTon;