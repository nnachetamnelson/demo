// src/middleware/errorHandler.js
const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
};