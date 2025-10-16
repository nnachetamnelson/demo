const Exam = require('../models/Exam');
const AcademicRecord = require('../models/AcademicRecord');
const logger = require('../utils/logger');
const axios = require('axios');
const Subject = require('../models/Subject');

const { Op } = require('sequelize');
const {
  validateCreateExam,
  validateUpdateExam,
  validateRecordGrade,
  validateBulkRecordGrade,
  validateGetGrades,
} = require('../utils/validation');

const createExam = async (req, res) => {
  try {
    const { error } = validateCreateExam(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { classId, subjectId, name, date, maxScore, semester, academicYear } = req.body;
    const tenantId = req.user.tenantId;

    const classResponse = await axios.get(
      `${process.env.CLASSROOM_SERVICE_URL}/api/classroom/classes/${classId}`,
      { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
    );
    if (!classResponse.data) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const subjectResponse = await axios.get(
      `${process.env.CLASSROOM_SERVICE_URL}/api/classroom/subjects/${subjectId}`,
      { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
    );
    if (!subjectResponse.data) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const exam = await Exam.create({
      tenantId,
      classId,
      subjectId,
      name,
      date,
      maxScore,
      semester,
      academicYear,
    });

    logger.info('Exam created', { name, classId, subjectId, tenantId });
    res.status(201).json({ success: true, message: 'Exam created', data: exam });
  } catch (error) {
    logger.error('Error creating exam', error);
    res.status(500).json({ success: false, message: 'Error creating exam' });
  }
};


const updateExam = async (req, res) => {
  try {
    const { error } = validateUpdateExam(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const examId = parseInt(req.params.examId, 10);
    const tenantId = req.user.tenantId;
    if (isNaN(examId)) {
      return res.status(400).json({ success: false, message: 'Invalid examId' });
    }

    const { name, date, maxScore, semester, academicYear } = req.body;
    const exam = await Exam.findOne({ where: { id: examId, tenantId } });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    exam.name = name !== undefined ? name : exam.name;
    exam.date = date !== undefined ? date : exam.date;
    exam.maxScore = maxScore !== undefined ? maxScore : exam.maxScore;
    exam.semester = semester !== undefined ? semester : exam.semester;
    exam.academicYear = academicYear !== undefined ? academicYear : exam.academicYear;
    await exam.save();

    logger.info('Exam updated', { examId, tenantId });
    res.json({ success: true, message: 'Exam updated', data: exam });
  } catch (error) {
    logger.error('Error updating exam', error);
    res.status(500).json({ success: false, message: 'Error updating exam' });
  }
};

const deleteExam = async (req, res) => {
  try {
    const examId = parseInt(req.params.examId, 10);
    const tenantId = req.user.tenantId;
    if (isNaN(examId)) {
      return res.status(400).json({ success: false, message: 'Invalid examId' });
    }

    const exam = await Exam.findOne({ where: { id: examId, tenantId } });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    await exam.destroy();
    logger.info('Exam deleted', { examId, tenantId });
    res.json({ success: true, message: 'Exam deleted' });
  } catch (error) {
    logger.error('Error deleting exam', error);
    res.status(500).json({ success: false, message: 'Error deleting exam' });
  }
};

const listExams = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { classId, subjectId, semester, academicYear } = req.query;
    const where = { tenantId };

    if (classId) where.classId = parseInt(classId, 10);
    if (subjectId) where.subjectId = parseInt(subjectId, 10);
    if (semester) where.semester = semester;
    if (academicYear) where.academicYear = academicYear;

    const exams = await Exam.findAll({ where });
    res.json(exams);
  } catch (error) {
    logger.error('Error listing exams', error);
    res.status(500).json({ success: false, message: 'Error listing exams' });
  }
};

const recordGrade = async (req, res) => {
  try {
    const { error } = validateRecordGrade(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { studentId, examId, grade } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    const role = req.user.role;

    const studentResponse = await axios.get(
      `${process.env.STUDENT_SERVICE_URL}/api/students/${studentId}`,
      { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
    );
    const student = studentResponse.data;
    if (!student || student.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Active student not found' });
    }

    const exam = await Exam.findOne({ where: { id: examId, tenantId } });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    if (role === 'teacher') {
      const teacherResponse = await axios.get(
        `${process.env.STUDENT_SERVICE_URL}/api/students/teachers?userId=${userId}`,
        { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
      );
      const teacher = teacherResponse.data;
      if (!teacher) {
        return res.status(403).json({ success: false, message: 'Teacher not found' });
      }

      const isSubjectTeacher = await TeacherSubject.findOne({
        where: { teacherId: teacher.id, subjectId: exam.subjectId, classId: exam.classId, tenantId },
      });
      if (!isSubjectTeacher) {
        return res.status(403).json({ success: false, message: 'Not authorized to record grades for this exam' });
      }
    }

    if (student.classId !== exam.classId) {
      return res.status(400).json({ success: false, message: 'Student not assigned to this class' });
    }

    const existingRecord = await AcademicRecord.findOne({
      where: { studentId, examId, tenantId },
    });
    if (existingRecord) {
      return res.status(400).json({ success: false, message: 'Grade already recorded for this student and exam' });
    }

    const academicRecord = await AcademicRecord.create({
      studentId,
      tenantId,
      subjectId: exam.subjectId,
      examId,
      grade,
      semester: exam.semester,
      academicYear: exam.academicYear,
    });

    logger.info('Grade recorded', { studentId, examId, tenantId });
    res.status(201).json({ success: true, message: 'Grade recorded', data: academicRecord });
  } catch (error) {
    logger.error('Error recording grade', error);
    res.status(500).json({ success: false, message: 'Error recording grade' });
  }
};

const bulkRecordGrade = async (req, res) => {
  try {
    const { error } = validateBulkRecordGrade(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { records } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    const role = req.user.role;

    const academicRecords = [];
    for (const record of records) {
      const { studentId, examId, grade } = record;

      const studentResponse = await axios.get(
        `${process.env.STUDENT_SERVICE_URL}/api/students/${studentId}`,
        { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
      );
      const student = studentResponse.data;
      if (!student || student.status !== 'active') {
        return res.status(404).json({ success: false, message: `Active student not found: ${studentId}` });
      }

      const exam = await Exam.findOne({ where: { id: examId, tenantId } });
      if (!exam) {
        return res.status(404).json({ success: false, message: `Exam not found: ${examId}` });
      }

      if (role === 'teacher') {
        const teacherResponse = await axios.get(
          `${process.env.STUDENT_SERVICE_URL}/api/students/teachers?userId=${userId}`,
          { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
        );
        const teacher = teacherResponse.data;
        if (!teacher) {
          return res.status(403).json({ success: false, message: 'Teacher not found' });
        }

        const isSubjectTeacher = await TeacherSubject.findOne({
          where: { teacherId: teacher.id, subjectId: exam.subjectId, classId: exam.classId, tenantId },
        });
        if (!isSubjectTeacher) {
          return res.status(403).json({ success: false, message: `Not authorized for exam ${examId}` });
        }
      }

      if (student.classId !== exam.classId) {
        return res.status(400).json({ success: false, message: `Student ${studentId} not assigned to class ${exam.classId}` });
      }

      const existingRecord = await AcademicRecord.findOne({
        where: { studentId, examId, tenantId },
      });
      if (existingRecord) {
        return res.status(400).json({ success: false, message: `Grade already recorded for student ${studentId}, exam ${examId}` });
      }

      academicRecords.push({
        studentId,
        tenantId,
        subjectId: exam.subjectId,
        examId,
        grade,
        semester: exam.semester,
        academicYear: exam.academicYear,
      });
    }

    await AcademicRecord.bulkCreate(academicRecords);
    logger.info('Bulk grades recorded', { count: academicRecords.length, tenantId });
    res.status(201).json({ success: true, message: 'Bulk grades recorded', data: academicRecords });
  } catch (error) {
    logger.error('Error recording bulk grades', error);
    res.status(500).json({ success: false, message: 'Error recording bulk grades' });
  }
};

const getGrades = async (req, res) => {
  try {
    const { error } = validateGetGrades(req.query);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { studentId, classId, subjectId, examId, semester, academicYear } = req.query;
    const tenantId = req.user.tenantId;
    const role = req.user.role;
    const userId = req.user.userId;

    const where = { tenantId };
    if (studentId) where.studentId = parseInt(studentId, 10);
    if (subjectId) where.subjectId = parseInt(subjectId, 10);
    if (examId) where.examId = parseInt(examId, 10);
    if (semester) where.semester = semester;
    if (academicYear) where.academicYear = academicYear;

    if (role === 'teacher') {
      const teacherResponse = await axios.get(
        `${process.env.STUDENT_SERVICE_URL}/api/students/teachers?userId=${userId}`,
        { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
      );
      const teacher = teacherResponse.data;
      if (!teacher) {
        return res.status(403).json({ success: false, message: 'Teacher not found' });
      }

      const allowedClasses = await Class.findAll({
        where: { formTeacherId: teacher.id, tenantId },
        attributes: ['id'],
      });
      const allowedTeacherSubjects = await TeacherSubject.findAll({
        where: { teacherId: teacher.id, tenantId },
        attributes: ['classId', 'subjectId'],
      });

      const allowedClassIds = allowedClasses.map(c => c.id);
      const allowedSubjectClassIds = allowedTeacherSubjects.map(ts => ts.classId);
      const allowedSubjectIds = allowedTeacherSubjects.map(ts => ts.subjectId);

      if (classId && !allowedClassIds.includes(parseInt(classId, 10)) && !allowedSubjectClassIds.includes(parseInt(classId, 10))) {
        return res.status(403).json({ success: false, message: 'Not authorized for this class' });
      }
      if (subjectId && !allowedSubjectIds.includes(parseInt(subjectId, 10))) {
        return res.status(403).json({ success: false, message: 'Not authorized for this subject' });
      }
    }

    if (classId) {
      const classResponse = await axios.get(
        `${process.env.CLASSROOM_SERVICE_URL}/api/classroom/classes/${classId}`,
        { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
      );
      if (!classResponse.data) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }
      const students = await Student.findAll({ where: { classId, tenantId }, attributes: ['id'] });
      where.studentId = students.map(s => s.id);
    }

    const grades = await AcademicRecord.findAll({
      where,
      include: [
        { model: Exam, as: 'exam' },
        { model: Subject, as: 'subject' },
      ],
    });
    res.json(grades);
  } catch (error) {
    logger.error('Error fetching grades', error);
    res.status(500).json({ success: false, message: 'Error fetching grades' });
  }
};

module.exports = {
  createExam,
  updateExam,
  deleteExam,
  listExams,
  recordGrade,
  bulkRecordGrade,
  getGrades,
};