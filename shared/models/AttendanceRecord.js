// models/AttendanceRecord.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');
const Student = require('./Student');
const Class = require('../../class-management-service/src/models/Class');
const Subject = require('./Subject');
const User = require('./User');

const AttendanceRecord = sequelize.define('AttendanceRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Student, key: 'id' }, onDelete: 'CASCADE' },
  classId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Class, key: 'id' }, onDelete: 'CASCADE' },
  subjectId: { type: DataTypes.INTEGER, allowNull: true, references: { model: Subject, key: 'id' }, onDelete: 'SET NULL' },
  tenantId: { type: DataTypes.STRING(50), allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('present', 'absent', 'late', 'excused'), allowNull: false },
  recordedBy: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' }, onDelete: 'CASCADE' },
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
