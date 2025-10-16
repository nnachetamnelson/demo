//shared/db/sequelize.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
	process.env.DB_NAME || 'education',
	process.env.DB_USER || 'postgres',
	process.env.DB_PASSWORD || 'secret',
	{
		host: process.env.DB_HOST || 'localhost',
		port: process.env.DB_PORT || 5432,
		dialect: process.env.DB_DIALECT || 'postgres',
		logging: false,
	}
);

module.exports = sequelize;

