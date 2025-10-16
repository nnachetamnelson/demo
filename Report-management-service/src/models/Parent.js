const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Parent = sequelize.define('Parent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'student', key: 'id' },
    freezeTableName: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  tenantId: { type: DataTypes.STRING(50), allowNull: false },
  firstName: { type: DataTypes.STRING(191), allowNull: false },
  lastName: { type: DataTypes.STRING(191), allowNull: false },
  relationship: { type: DataTypes.STRING(50), allowNull: false },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  email: { type: DataTypes.STRING(191), allowNull: true, validate: { isEmail: true } },
}, {
  tableName: 'parent',
  timestamps: true,
});

module.exports = Parent;
