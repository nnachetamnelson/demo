const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    logger.warn('No token provided');
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    // Decode and verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      tenantId: decoded.tenantId,
      role: decoded.role,
    };

    // Enforce admin-only access
    if (req.user.role !== 'admin') {
      logger.warn('Non-admin access attempt', { id: decoded.id, tenantId: decoded.tenantId });
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    next();
  } catch (error) {
    logger.error('Invalid token', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
