const express = require('express');
const {
  getReportCard,
  getClassReport,
  getAttendanceReport,
} = require('../controllers/report-controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/report-card', getReportCard);
router.get('/class-report', getClassReport);
router.get('/attendance-report', getAttendanceReport);

module.exports = router;
