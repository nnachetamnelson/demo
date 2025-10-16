const express = require('express');
const {
  createClass,
  getClass,
  updateClass,
  deleteClass,
  listClasses,
  createSubject,
  assignSubjectTeacher,
  assignStudentsToClass,
  getSubjectById, getAllSubjects,deleteSubject,
     updateSubject,
} = require('../controllers/classroom-controller');
const { createLevel,
    getAllLevels,
  updateLevel,
  deleteLevel, } = require('../controllers/levelController');

  const {
  updateStaff,
  deleteStaff,
  createStaff,
   getStaff,
  deactivateStaff,
  getTeachersDropdown,
  getTeacher,
} = require('../controllers/staffController');


const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.post('/classes', createClass);
router.get('/classes/:classId', getClass);
router.put('/classes/:classId', updateClass);
router.delete('/classes/:classId', deleteClass);
router.get('/classes', listClasses);
router.post('/level', createLevel);
router.get('/level', getAllLevels);
router.put('/level/:id', updateLevel);
router.delete('/level/:id', deleteLevel);
router.post('/subjects', createSubject);
router.get("/subjects/:id", getSubjectById);
router.get("/subjects", getAllSubjects);
router.put("/subjects/:id", updateSubject);
router.delete("/subjects/:id", deleteSubject,);
router.post('/subjects/assign-teacher', assignSubjectTeacher);
router.post('/classes/assign-students', assignStudentsToClass);

router.post('/staff', createStaff);
// Update a staff record
router.put('/staff/:id', updateStaff);
// Get all staff
router.get("/staff", getStaff);

// Get single staff
router.get("/staff/:id", getStaff);

// Delete a staff record
router.delete('/staff/:id', deleteStaff);
// Deactivate a staff record
router.patch('/staff/deactivate/:id', deactivateStaff);

router.get('/teachers', getTeacher);
router.get('/teacher/:id', getTeacher);
router.get('/teachers-dropdown', getTeachersDropdown );




module.exports = router;

