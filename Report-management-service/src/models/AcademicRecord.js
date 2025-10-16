const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AcademicRecord = sequelize.define('AcademicRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false }, // 🔥 removed FK
  tenantId: { type: DataTypes.STRING(50), allowNull: false },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'subjects', key: 'id' },
  },
  examId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'exams', key: 'id' },
  },
  grade: { type: DataTypes.STRING(10), allowNull: true },
  semester: { type: DataTypes.STRING(50), allowNull: true },
  academicYear: { type: DataTypes.STRING(10), allowNull: true },
}, {
  tableName: 'academic_records',
  timestamps: true,
  indexes: [
    { fields: ['studentId'] },
    { fields: ['tenantId'] },
    { fields: ['subjectId'] },
    { fields: ['examId'] },
  ],
});



module.exports = AcademicRecord;
