const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Class = sequelize.define('Class', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  tenantId: { type: DataTypes.STRING(50), allowNull: false },

  // 👇 Level of the class (e.g. "JS 1", "SS 2")
  level: { type: DataTypes.STRING(50), allowNull: false },

  // 👇 Specific class name (e.g. "JS 1C")
  name: { type: DataTypes.STRING(191), allowNull: false },

  formTeacherId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'teachers', key: 'id' },
    onDelete: 'SET NULL',
  },
}, {
  tableName: 'classes',
  timestamps: true,
  indexes: [
    { fields: ['tenantId'] },
    { fields: ['level'] },
    { fields: ['formTeacherId'] },
  ],
});

module.exports = Class;