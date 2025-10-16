// shared/models/ExamComponentResult.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');
const Student = require('./Student');
const ExamComponent = require('./ExamComponent');

const ExamComponentResult = sequelize.define('ExamComponentResult', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Student, key: 'id' }, onDelete: 'CASCADE' },
  componentId: { type: DataTypes.INTEGER, allowNull: false, references: { model: ExamComponent, key: 'id' }, onDelete: 'CASCADE' },
  score: { type: DataTypes.DECIMAL(5,2), allowNull: false },
}, {
  tableName: 'exam_component_results',
  timestamps: true,
});


module.exports = ExamComponentResult;
