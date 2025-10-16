const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Level = sequelize.define('Level', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenantId: { type: DataTypes.STRING(50), allowNull: false },
  name: { type: DataTypes.STRING(50), allowNull: false },
  category: {
    type: DataTypes.ENUM('Nursery', 'Primary', 'Junior', 'Senior'),
    allowNull: false,
  },
}, {
  tableName: 'levels',
  timestamps: true,
  indexes: [
    { fields: ['tenantId'] },
    { unique: true, fields: ['tenantId', 'name'] },
  ],
});

module.exports = Level;
