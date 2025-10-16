const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const ClassLevelCA = sequelize.define('ClassLevelCA', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenantId: { type: DataTypes.STRING(50), allowNull: false },
  classLevel: { type: DataTypes.STRING(50), allowNull: false },
  caption: { type: DataTypes.STRING(50), allowNull: false }, // CA1, CA2
  maxScore: { type: DataTypes.DECIMAL(5,2), allowNull: false },
  enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'class_level_cas',
  timestamps: true,
});

module.exports = ClassLevelCA;
