const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const AcademicRecord = sequelize.define('AcademicRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  studentId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'students', key: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },

  tenantId: { 
    type: DataTypes.STRING(50), 
    allowNull: false 
  },

  session: { 
    type: DataTypes.STRING(20), 
    allowNull: true 
  },

  firstTerm: { 
    type: DataTypes.DECIMAL(5,2), 
    allowNull: true 
  },

  secondTerm: { 
    type: DataTypes.DECIMAL(5,2), 
    allowNull: true 
  },

  thirdTerm: { 
    type: DataTypes.DECIMAL(5,2), 
    allowNull: true 
  },

  highestAverage: { 
    type: DataTypes.DECIMAL(5,2), 
    allowNull: true 
  },

  studentAverage: { 
    type: DataTypes.DECIMAL(5,2), 
    allowNull: true 
  },

  lowestAverage: { 
    type: DataTypes.DECIMAL(5,2), 
    allowNull: true 
  },

}, {
  tableName: 'academic_records',
  timestamps: true,
  indexes: [
    { fields: ['studentId'] },
    { fields: ['tenantId'] },
  ],
});

module.exports = AcademicRecord;



