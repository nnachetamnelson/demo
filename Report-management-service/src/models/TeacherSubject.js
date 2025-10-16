const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TeacherSubject = sequelize.define('TeacherSubject', {
  
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'teachers', key: 'id' },
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'subjects', key: 'id' },
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'classes', key: 'id' },
  },
  tenantId: { 
    type: DataTypes.STRING(50), 
    allowNull: false,
  },
}, {
  tableName: 'teacher_subjects',
  timestamps: false,
  indexes: [
    { fields: ['tenantId'] },
    { unique: true, fields: ['teacherId', 'subjectId', 'classId', 'tenantId'] }, // ✅ Prevents duplicates
  ],
});

module.exports = TeacherSubject;
