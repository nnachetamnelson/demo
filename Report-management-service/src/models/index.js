const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Import models
const AcademicRecord = require('./AcademicRecord');
const Exam = require('./Exam');
const Subject = require('./Subject');
const AttendanceRecord = require('./AttendanceRecord');
const TeacherSubject = require('./TeacherSubject');

// Initialize associations
// AcademicRecord belongs to Exam and Subject
AcademicRecord.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });
AcademicRecord.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

// Exam has many AcademicRecords
Exam.hasMany(AcademicRecord, { foreignKey: 'examId', as: 'academicRecords' });

// Subject has many AcademicRecords
Subject.hasMany(AcademicRecord, { foreignKey: 'subjectId', as: 'academicRecords' });

// AttendanceRecord belongs to Subject (optional) and references studentId
AttendanceRecord.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

// TeacherSubject links Teacher, Class, and Subject (used in authorization)
TeacherSubject.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

// Export all models and sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  AcademicRecord,
  Exam,
  Subject,
  AttendanceRecord,
  TeacherSubject,
};
