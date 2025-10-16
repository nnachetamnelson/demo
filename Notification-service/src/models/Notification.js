// src/models/Notification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define(
  'Notification',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId: { type: DataTypes.STRING(50), allowNull: false },

    // Link to User (students/teachers/etc.)
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // Link to Parent
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    type: {
      type: DataTypes.ENUM('email', 'sms', 'in_app'),
      allowNull: false,
    },
    eventType: {
      type: DataTypes.ENUM(
        'grade_updated',
        'attendance_alert',
        'report_card',
        'exam_reminder',
        'custom'
      ),
      allowNull: false,
    },
    content: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    sentAt: { type: DataTypes.DATE, allowNull: true },
    
  },
  {
    tableName: 'notifications',
    timestamps: true,
    indexes: [
      { fields: ['tenantId'] },
      { fields: ['userId'] },
      { fields: ['parentId'] },
      { fields: ['eventType'] },
      { fields: ['status'] },
    ],
  }
);

module.exports = Notification;
