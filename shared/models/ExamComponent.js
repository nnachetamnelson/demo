// shared/models/ExamComponent.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');
const Exam = require('./Exam');

const ExamComponent = sequelize.define('ExamComponent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  examId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Exam, key: 'id' }, onDelete: 'CASCADE' },
  name: { type: DataTypes.STRING(100), allowNull: false }, // e.g., "CA 1", "Project"
  maxScore: { type: DataTypes.DECIMAL(5,2), allowNull: false },
}, {
  tableName: 'exam_components',
  timestamps: true,
});



module.exports = ExamComponent;
