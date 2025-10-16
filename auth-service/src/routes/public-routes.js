// Public routes that don't require authentication
const express = require('express');
const Subject = require('../../../shared/models/Subject');
const logger = require('../utils/logger');

const router = express.Router();

// Get subjects for a tenant (for registration form)
router.get('/subjects/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const subjects = await Subject.findAll({
      where: { tenantId },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });

    res.json({ success: true, data: subjects });
  } catch (error) {
    logger.error('Error fetching subjects:', error);
    res.status(500).json({ success: false, message: 'Error fetching subjects' });
  }
});

module.exports = router;
