const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Exam = sequelize.define('Exam', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenantId: { type: DataTypes.STRING(50), allowNull: false },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'classes', key: 'id' },
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'subjects', key: 'id' },
  },
  name: { type: DataTypes.STRING(191), allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  maxScore: { type: DataTypes.DECIMAL(5,2), allowNull: false },
  semester: { type: DataTypes.STRING(50), allowNull: true },
  academicYear: { type: DataTypes.STRING(10), allowNull: true },
}, {
  tableName: 'exams',
  timestamps: true,
  indexes: [
    { fields: ['tenantId'] },
    { fields: ['classId'] },
    { fields: ['subjectId'] },
    { fields: ['date'] },
  ],
});

module.exports = Exam;