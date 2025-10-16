const express = require('express');
const {
  createAttendance,
  bulkCreateAttendance,
  getAttendance,
} = require('../controllers/attendance-controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.post('/', createAttendance);
router.post('/bulk', bulkCreateAttendance);
router.get('/', getAttendance);

module.exports = router;