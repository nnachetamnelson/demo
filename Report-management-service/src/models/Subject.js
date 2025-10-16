const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Subject = sequelize.define('Subject', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenantId: { type: DataTypes.STRING(50), allowNull: false },
  name: { type: DataTypes.STRING(191), allowNull: false },
}, {
  tableName: 'subjects',
  timestamps: true,
  indexes: [
    { fields: ['tenantId'] },
  ],
});

module.exports = Subject;