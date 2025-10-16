const express = require('express');
const router = express.Router();

// ✅ Controllers
const {
  createExam,
  updateExam,
  deleteExam,
  listExams,
  recordGrade,
  bulkRecordGrade,
  getGrades,
} = require('../controllers/exam-controller');

const { createExamWithAutoCAs } = require('../controllers/examController');
const { addStudentScores } = require('../controllers/examScoreController');
const {
  saveCASetup,
  getCASetup,
  updateCASetup,
} = require('../controllers/classLevelCAController');

// ✅ Middleware
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Protect all routes
router.use(authMiddleware);

/* ===============================
   📘 EXAM MANAGEMENT ROUTES
================================ */
router.post('/exams', createExam);                // Create exam manually
router.post('/exams/auto', createExamWithAutoCAs); // Create exam with auto-generated CAs
router.put('/exams/:examId', updateExam);          // Update exam
router.delete('/exams/:examId', deleteExam);       // Delete exam
router.get('/exams', listExams);                   // List all exams

/* ===============================
   🧾 SCORE MANAGEMENT ROUTES
================================ */
router.post('/scores', addStudentScores);          // Record student scores (components)
router.post('/grades', recordGrade);               // Record single student grade
router.post('/grades/bulk', bulkRecordGrade);      // Bulk grade recording
router.get('/grades', getGrades);                  // Fetch grades

/* ===============================
   🧮 CLASS LEVEL CA SETUP ROUTES
================================ */
router.post('/ca/setup', saveCASetup);             // Create or upsert CA setup for class level
router.get('/ca/setup/:classLevel', getCASetup);   // Get CA setup by class level
router.put('/ca/setup/:id', updateCASetup);        // Update a specific CA record


module.exports = router;

