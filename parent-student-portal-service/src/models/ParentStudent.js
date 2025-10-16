const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ParentStudent = sequelize.define('ParentStudent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenantId: { type: DataTypes.STRING(50), allowNull: false },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'parent_students',
  timestamps: true,
  indexes: [
    { fields: ['tenantId'] },
    { fields: ['parentId'] },
    { fields: ['studentId'] },
    { unique: true, fields: ['parentId', 'studentId', 'tenantId'] },
  ],
});

module.exports = ParentStudent;
