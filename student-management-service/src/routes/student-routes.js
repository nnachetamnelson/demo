const express = require('express');
const {
  createStudent,
  getStudent,
  updateStudent,
  deleteStudent,
  listStudents,
  createParent,
  createClub,
  assignClub,
  createTeacher,
  assignFormTeacher,
  createSubject,
  assignSubjectTeacher,
} = require('../controllers/student-controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.post('/', createStudent);
router.get('/:studentId', getStudent);
router.put('/:studentId', updateStudent);
router.delete('/:studentId', deleteStudent);
router.get('/', listStudents);
router.post('/parents', createParent);
router.post('/clubs', createClub);
router.post('/clubs/assign', assignClub);
router.post('/teachers', createTeacher);
router.post('/teachers/assign-form', assignFormTeacher);
router.post('/subjects', createSubject);
router.post('/teachers/assign-subject', assignSubjectTeacher);

module.exports = router;


