const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AttendanceRecord = sequelize.define('AttendanceRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'student', key: 'id' },
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'classes', key: 'id' },
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'subjects', key: 'id' },
    
  },
  tenantId: { type: DataTypes.STRING(50), allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
    allowNull: false,
  },
  recordedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'attendance_records',
  timestamps: true,
  indexes: [
    { fields: ['studentId'] },
    { fields: ['classId'] },
    { fields: ['subjectId'] },
    { fields: ['tenantId'] },
    { fields: ['date'] },
  ],
});

module.exports = AttendanceRecord;