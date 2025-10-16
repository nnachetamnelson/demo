const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const TeacherSubject = sequelize.define('TeacherSubject', {
	teacherId: { type: DataTypes.INTEGER, allowNull: false },
	subjectId: { type: DataTypes.INTEGER, allowNull: false },
	classId: { type: DataTypes.INTEGER, allowNull: false },
	tenantId: { type: DataTypes.STRING(50), allowNull: false },
}, {
	tableName: 'teacher_subjects',
	timestamps: false,
	indexes: [
		{ fields: ['tenantId'] },
		{ unique: true, fields: ['teacherId', 'subjectId', 'classId', 'tenantId'] },
	],
});

module.exports = TeacherSubject;


