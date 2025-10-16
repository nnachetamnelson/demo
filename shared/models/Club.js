const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const Club = sequelize.define('Club', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	tenantId: { type: DataTypes.STRING(50), allowNull: false },
	name: { type: DataTypes.STRING(191), allowNull: false },
	description: { type: DataTypes.TEXT, allowNull: true },
}, {
	tableName: 'clubs',
	timestamps: true,
	indexes: [
		{ fields: ['tenantId'] },
	],
});

module.exports = Club;


