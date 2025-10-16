const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const Teacher = sequelize.define('Teacher', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	tenantId: { type: DataTypes.STRING(50), allowNull: false },
	firstName: { type: DataTypes.STRING(191), allowNull: false },
	lastName: { type: DataTypes.STRING(191), allowNull: false },
	status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
	staffId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
	userId: {
  type: DataTypes.INTEGER,
  allowNull: true
}

}, {
	tableName: 'teachers',
	timestamps: true,
	indexes: [
		{ fields: ['tenantId'] },
		{ fields: ['status'] },
	],
});

module.exports = Teacher;
