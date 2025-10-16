const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Teacher = sequelize.define('Teacher', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'userId_tenantId',
    references: { model: 'users', key: 'id' },
  },
  tenantId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: 'userId_tenantId',
  },
  firstName: { type: DataTypes.STRING(191), allowNull: false },
  lastName: { type: DataTypes.STRING(191), allowNull: false },
}, {
  tableName: 'teachers',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['userId', 'tenantId'], name: 'userId_tenantId' },
    { fields: ['tenantId'] },
  ],
});

module.exports = Teacher;

