// models/NotificationPreference.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const NotificationPreference = sequelize.define('NotificationPreference', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenantId: { type: DataTypes.STRING(50), allowNull: false },

  // Either userId OR parentId will be set
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  emailEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  smsEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  inAppEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'notification_preferences',
  timestamps: true,
  indexes: [
    { fields: ['tenantId'] },
    { fields: ['userId'] },
    { fields: ['parentId'] },
  ],
});

// Ensure either userId or parentId is set, not both
NotificationPreference.addHook('beforeValidate', (pref) => {
  if (!pref.userId && !pref.parentId) {
    throw new Error('Either userId or parentId must be set');
  }
  if (pref.userId && pref.parentId) {
    throw new Error('Cannot have both userId and parentId');
  }
});

module.exports = NotificationPreference;

