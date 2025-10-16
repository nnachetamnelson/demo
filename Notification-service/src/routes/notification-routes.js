const express = require('express');
const {
  sendNotification,
  bulkSendNotification,
  getNotifications,
  setNotificationPreferences,
  getNotificationPreferences,
} = require('../controllers/notification-controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Single notification
router.post('/', sendNotification);

// Bulk notifications
router.post('/bulk', bulkSendNotification);

// Fetch notifications for logged-in user
router.get('/', getNotifications);

// Manage preferences
router.put('/preferences', setNotificationPreferences);
router.get('/preferences', getNotificationPreferences);

module.exports = router;


