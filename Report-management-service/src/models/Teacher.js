const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Teacher = sequelize.define('Teacher', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
  
  },
  tenantId: { 
    type: DataTypes.STRING(50), 
    allowNull: false, 

  },
  firstName: { 
    type: DataTypes.STRING(191), 
    allowNull: false 
  },
  lastName: { 
    type: DataTypes.STRING(191), 
    allowNull: false 
  },
  status: {   // ✅ Add status since you’re indexing it
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  }
}, {
  tableName: 'teachers',
  timestamps: true,
  indexes: [
    { fields: ['tenantId'] },
    { fields: ['status'] },
  ],
});

module.exports = Teacher;
