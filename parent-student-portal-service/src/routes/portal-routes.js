const express = require('express');
const {
  getReportCard,
  getGrades,
  getAttendance,
  linkParentStudent,
  getParentStudents,
} = require('../controllers/portal-controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/report-card', getReportCard);
router.get('/grades', getGrades);
router.get('/attendance', getAttendance);
router.post('/parent-student', linkParentStudent);
router.get('/parent-students', getParentStudents);

module.exports = router;