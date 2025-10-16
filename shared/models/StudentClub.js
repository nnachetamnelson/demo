const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const StudentClub = sequelize.define('StudentClub', {
	studentId: { type: DataTypes.INTEGER, references: { model: 'student', key: 'id' }, onDelete: 'CASCADE' },
	clubId: { type: DataTypes.INTEGER, references: { model: 'clubs', key: 'id' }, onDelete: 'CASCADE' },
	tenantId: { type: DataTypes.STRING(50), allowNull: false },
}, {
	tableName: 'student_club',
	timestamps: true,
});

module.exports = StudentClub;


