const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Student = sequelize.define('Student', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  userId: {  
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'userId_tenantId',
  },
  tenantId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: 'userId_tenantId',
  },
  firstName: { 
    type: DataTypes.STRING(191), 
    allowNull: false 
  },
  lastName: { 
    type: DataTypes.STRING(191), 
    allowNull: false 
  },
  dateOfBirth: { 
    type: DataTypes.DATEONLY, 
    allowNull: true 
  },
  heightCm: { 
    type: DataTypes.DECIMAL(5,2), 
    allowNull: true 
  },
  weightKg: { 
    type: DataTypes.DECIMAL(5,2), 
    allowNull: true 
  },
  status: {
    type: DataTypes.ENUM('active', 'graduated', 'deactivated'),
    defaultValue: 'active',
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'classes', key: 'id' },
  },
}, {
  tableName: 'student',
  timestamps: true,
  indexes: [
    
    { fields: ['tenantId'] },
    { fields: ['classId'] },
    { fields: ['status'] },
  ],
});

module.exports = Student;

