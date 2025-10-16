const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const ClassSubject = sequelize.define('ClassSubject', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	classId: { type: DataTypes.INTEGER, allowNull: false },
	subjectId: { type: DataTypes.INTEGER, allowNull: false },
}, {
	tableName: 'class_subjects',
	timestamps: false,
});

module.exports = ClassSubject;


