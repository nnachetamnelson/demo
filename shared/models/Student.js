//shared/models/Student
const { DataTypes } = require('sequelize');

const sequelize = require('../db/sequelize');

const Student = sequelize.define('Student', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  tenantId: { 
    type: DataTypes.STRING(50), 
    allowNull: false 
  },

  firstName: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },

  middleName: { 
    type: DataTypes.STRING(100), 
    allowNull: true 
  },

  lastName: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },

  gender: { 
    type: DataTypes.ENUM('Male', 'Female', 'Other'), 
    allowNull: false 
  },

  admissionNumber: { 
    type: DataTypes.STRING(50), 
    allowNull: false, 
    unique: true 
  },

  userId: {
  type: DataTypes.UUID,
  allowNull: true,
},

level: { type: DataTypes.STRING, allowNull: true },

classId: {
  type: DataTypes.INTEGER,
  allowNull: true,
},


  dob: { 
    type: DataTypes.DATEONLY, 
    allowNull: true 
  },

  picture: { 
    type: DataTypes.STRING(255), 
    allowNull: true 
  },

  dateAdmitted: { 
    type: DataTypes.DATEONLY, 
    allowNull: true 
  },

  email: { 
    type: DataTypes.STRING(191), 
    allowNull: true, 
    validate: { isEmail: true } 
  },

  stateOfOrigin: { 
    type: DataTypes.STRING(100), 
    allowNull: true 
  },

  lga: { 
    type: DataTypes.STRING(100), 
    allowNull: true 
  },

  homeAddress: { 
    type: DataTypes.STRING(255), 
    allowNull: true 
  },

  previousSchool: { 
    type: DataTypes.STRING(191), 
    allowNull: true 
  },

  status: { 
    type: DataTypes.ENUM('active', 'graduated', 'deactivated'), 
    defaultValue: 'active' 
  },

}, {
  tableName: 'students',
  timestamps: true,
  indexes: [
    { fields: ['tenantId'] },
    { fields: ['admissionNumber'] },
    { fields: ['status'] },
  ],
});

module.exports = Student;

