const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const StudentSubject = sequelize.define('StudentSubject', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
  },
  subjectId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
  },
  tenantId: { type: DataTypes.STRING(50), allowNull: false },
  enrolledAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'student_subjects',
  timestamps: true,
  indexes: [
    { fields: ['studentId'] },
    { fields: ['subjectId'] },
    { fields: ['tenantId'] },
    { unique: true, fields: ['studentId', 'subjectId', 'tenantId'] },
  ],
});

module.exports = StudentSubject;
