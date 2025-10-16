const ParentStudent = require('../models/ParentStudent');
const logger = require('../utils/logger');
const axios = require('axios');
const {
  validateReportCard,
  validateGrades,
  validateAttendance,
  validateParentStudent,
} = require('../utils/validation');

const getReportCard = async (req, res) => {
  try {
    const { error } = validateReportCard(req.query);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { studentId, semester, academicYear } = req.query;
    const tenantId = req.user.tenantId;
    const role = req.user.role;
    const userId = req.user.userId;

    const studentResponse = await axios.get(
      `${process.env.STUDENT_SERVICE_URL}/api/students/${studentId}`,
      { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
    );
    const student = studentResponse.data;
    if (!student || student.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Active student not found' });
    }

    if (role === 'parent') {
      const parentStudent = await ParentStudent.findOne({
        where: { parentId: userId, studentId, tenantId },
      });
      if (!parentStudent) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this student’s report card' });
      }
    } else if (role === 'student' && student.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Students can only view their own report card' });
    }

    const reportCardResponse = await axios.get(
      `${process.env.REPORTING_SERVICE_URL}/api/reports/report-card?studentId=${studentId}${semester ? `&semester=${semester}` : ''}${academicYear ? `&academicYear=${academicYear}` : ''}`,
      { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
    );

    logger.info('Report card retrieved via portal', { studentId, tenantId, userId });
    res.json({ success: true, message: 'Report card retrieved', data: reportCardResponse.data.data });
  } catch (error) {
    logger.error('Error retrieving report card', error);
    res.status(500).json({ success: false, message: 'Error retrieving report card' });
  }
};

const getGrades = async (req, res) => {
  try {
    const { error } = validateGrades(req.query);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { studentId, semester, academicYear } = req.query;
    const tenantId = req.user.tenantId;
    const role = req.user.role;
    const userId = req.user.userId;

    const studentResponse = await axios.get(
      `${process.env.STUDENT_SERVICE_URL}/api/students/${studentId}`,
      { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
    );
    const student = studentResponse.data;
    if (!student || student.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Active student not found' });
    }

    if (role === 'parent') {
      const parentStudent = await ParentStudent.findOne({
        where: { parentId: userId, studentId, tenantId },
      });
      if (!parentStudent) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this student’s grades' });
      }
    } else if (role === 'student' && student.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Students can only view their own grades' });
    }

    const gradesResponse = await axios.get(
      `${process.env.EXAM_SERVICE_URL}/api/exams/grades?studentId=${studentId}${semester ? `&semester=${semester}` : ''}${academicYear ? `&academicYear=${academicYear}` : ''}`,
      { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
    );

    logger.info('Grades retrieved via portal', { studentId, tenantId, userId });
    res.json({ success: true, message: 'Grades retrieved', data: gradesResponse.data.data });
  } catch (error) {
    logger.error('Error retrieving grades', error);
    res.status(500).json({ success: false, message: 'Error retrieving grades' });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { error } = validateAttendance(req.query);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { studentId, startDate, endDate } = req.query;
    const tenantId = req.user.tenantId;
    const role = req.user.role;
    const userId = req.user.userId;

    const studentResponse = await axios.get(
      `${process.env.STUDENT_SERVICE_URL}/api/students/${studentId}`,
      { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
    );
    const student = studentResponse.data;
    if (!student || student.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Active student not found' });
    }

    if (role === 'parent') {
      const parentStudent = await ParentStudent.findOne({
        where: { parentId: userId, studentId, tenantId },
      });
      if (!parentStudent) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this student’s attendance' });
      }
    } else if (role === 'student' && student.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Students can only view their own attendance' });
    }

    const attendanceResponse = await axios.get(
      `${process.env.ATTENDANCE_SERVICE_URL}/api/attendance?studentId=${studentId}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`,
      { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
    );

    logger.info('Attendance retrieved via portal', { studentId, tenantId, userId });
    res.json({ success: true, message: 'Attendance retrieved', data: attendanceResponse.data.data });
  } catch (error) {
    logger.error('Error retrieving attendance', error);
    res.status(500).json({ success: false, message: 'Error retrieving attendance' });
  }
};

const linkParentStudent = async (req, res) => {
  try {
    const { error } = validateParentStudent(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { parentId, studentId } = req.body;
    const tenantId = req.user.tenantId;
    const role = req.user.role;

    if (role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const parentProfile = await axios.get(
      `${process.env.PROFILE_SERVICE_URL}/api/profiles/${parentId}`,
      { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
    );
    if (parentProfile.data.role !== 'parent') {
      return res.status(400).json({ success: false, message: 'User must have parent role' });
    }

    const studentResponse = await axios.get(
      `${process.env.STUDENT_SERVICE_URL}/api/students/${studentId}`,
      { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
    );
    if (!studentResponse.data || studentResponse.data.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Active student not found' });
    }

    const existingLink = await ParentStudent.findOne({
      where: { parentId, studentId, tenantId },
    });
    if (existingLink) {
      return res.status(400).json({ success: false, message: 'Parent-student link already exists' });
    }

    const parentStudent = await ParentStudent.create({
      tenantId,
      parentId,
      studentId,
    });

    logger.info('Parent-student link created', { parentId, studentId, tenantId });
    res.status(201).json({ success: true, message: 'Parent-student link created', data: parentStudent });
  } catch (error) {
    logger.error('Error linking parent to student', error);
    res.status(500).json({ success: false, message: 'Error linking parent to student' });
  }
};

const getParentStudents = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const role = req.user.role;
    const userId = req.user.userId;

    if (role !== 'parent' && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Parent or admin access required' });
    }

    const where = { tenantId };
    if (role === 'parent') {
      where.parentId = userId;
    }

    const parentStudents = await ParentStudent.findAll({ where });
    const studentIds = parentStudents.map(ps => ps.studentId);
    const studentsResponse = await axios.get(
      `${process.env.STUDENT_SERVICE_URL}/api/students?ids=${studentIds.join(',')}`,
      { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
    );

    const result = parentStudents.map(ps => {
      const student = studentsResponse.data.find(s => s.id === ps.studentId);
      return {
        parentId: ps.parentId,
        studentId: ps.studentId,
        student: student ? { id: student.id, firstName: student.firstName, lastName: student.lastName } : null,
      };
    });

    logger.info('Parent-student links retrieved', { tenantId, userId });
    res.json({ success: true, message: 'Parent-student links retrieved', data: result });
  } catch (error) {
    logger.error('Error retrieving parent-student links', error);
    res.status(500).json({ success: false, message: 'Error retrieving parent-student links' });
  }
};

module.exports = {
  getReportCard,
  getGrades,
  getAttendance,
  linkParentStudent,
  getParentStudents,
};