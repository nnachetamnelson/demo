// src/models/Profile.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'userId_tenantId',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  tenantId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: 'userId_tenantId',
  },
  email: {
    type: DataTypes.STRING(191),
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING(191),
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  profilePicture: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'profiles',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'tenantId'],
      name: 'userId_tenantId',
    },
  ],
});

module.exports = Profile;