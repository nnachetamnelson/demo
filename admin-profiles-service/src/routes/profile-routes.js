const express = require('express');
const { getProfile, updateProfile, syncProfile } = require('../controllers/profile-controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/:userId', getProfile);
router.put('/:userId', updateProfile); 
router.post('/sync', syncProfile);

module.exports = router;

