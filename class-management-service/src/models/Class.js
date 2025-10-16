// models/Class.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Class = sequelize.define('Class', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenantId: { type: DataTypes.STRING(50), allowNull: false },

  // e.g. "JS 1A"
  name: { type: DataTypes.STRING(191), allowNull: false },

  // Foreign key to Level
  levelId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'levels', key: 'id' },
    onDelete: 'CASCADE',
  },

  

  // Foreign key to Teacher
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
    { fields: ['levelId'] },
    { fields: ['formTeacherId'] },
    { unique: true, fields: ['tenantId', 'name'] }, // Prevent duplicates per tenant
  ],
});

module.exports = Class;


