// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    logger.warn('No token provided');
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Sets req.user.userId
    next();
  } catch (error) {
    logger.error('Invalid token', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};