const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const Parent = sequelize.define('Parent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'students', key: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },

  tenantId: { 
    type: DataTypes.STRING(50), 
    allowNull: false 
  },

  fatherName: { 
    type: DataTypes.STRING(191), 
    allowNull: true 
  },

  fatherPhone: { 
    type: DataTypes.STRING(20), 
    allowNull: true 
  },

  fatherOccupation: { 
    type: DataTypes.STRING(100), 
    allowNull: true 
  },

  motherName: { 
    type: DataTypes.STRING(191), 
    allowNull: true 
  },

  motherPhone: { 
    type: DataTypes.STRING(20), 
    allowNull: true 
  },

  motherOccupation: { 
    type: DataTypes.STRING(100), 
    allowNull: true 
  },

  address: { 
    type: DataTypes.STRING(255), 
    allowNull: true 
  },

}, {
  tableName: 'parents',
  timestamps: true,
  indexes: [
    { fields: ['studentId'] },
    { fields: ['tenantId'] },
  ],
});

module.exports = Parent;
