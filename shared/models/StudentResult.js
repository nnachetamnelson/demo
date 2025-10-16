// models/StudentResult.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');
const Student = require('./Student');

const StudentResult = sequelize.define('StudentResult', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Student, key: 'id' } },
  classId: { type: DataTypes.INTEGER, allowNull: false },
  term: { type: DataTypes.STRING(50), allowNull: false },
  session: { type: DataTypes.STRING(10), allowNull: false },
  average: { type: DataTypes.DECIMAL(5,2), allowNull: false },
  position: { type: DataTypes.STRING(10), allowNull: false },
}, {
  tableName: 'student_results',
  timestamps: true,
});

StudentResult.belongsTo(Student, { foreignKey: 'studentId' });

module.exports = StudentResult;
