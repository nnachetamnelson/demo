const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  tenantId: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },

  // 👇 Subject name
  name: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },

  // 👇 Level association (optional)
  // If null → subject applies to ALL levels
  levelId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'levels', key: 'id' },
    onDelete: 'SET NULL',
  },

  appliesToAllLevels: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

}, {
  tableName: 'subjects',
  timestamps: true,
  indexes: [
    { fields: ['tenantId'] },
    { fields: ['levelId'] },
  ],
});

module.exports = Subject;
