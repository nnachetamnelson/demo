const axios = require('axios');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { AcademicRecord, Exam, Subject, AttendanceRecord, TeacherSubject, Class } = require('../models');
const sequelize = require('../config/db');
const {
  validateReportCard,
  validateClassReport,
  validateAttendanceReport,
} = require('../utils/validation');



const getReportCard = async (req, res) => {
  try {
    const { error } = validateReportCard(req.query);
    if (error) 
      return res.status(400).json({ success: false, message: error.details[0].message });

    const { studentId, semester, academicYear } = req.query;
    const tenantId = req.user.tenantId;
    const role = req.user.role;
    const userId = req.user.userId;

    // Fetch student
    const studentResponse = await axios.get(
      `${process.env.STUDENT_SERVICE_URL}/api/students/${studentId}`,
      { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
    );
    const student = studentResponse.data;
    if (!student || student.status !== 'active') 
      return res.status(404).json({ success: false, message: 'Active student not found' });

    // Teacher permission check
    if (role === 'teacher') {
      const teacherResponse = await axios.get(
        `${process.env.STUDENT_SERVICE_URL}/api/students/teachers?userId=${userId}`,
        { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
      );
      const teacher = teacherResponse.data;
      if (!teacher) return res.status(403).json({ success: false, message: 'Teacher not found' });

      const classResponse = await axios.get(
        `${process.env.CLASSROOM_SERVICE_URL}/api/classroom/classes/${student.classId}`,
        { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
      );
      const isFormTeacher = classResponse.data.formTeacherId === teacher.id;
      const isSubjectTeacher = await TeacherSubject.findOne({
        where: { teacherId: teacher.id, classId: student.classId, tenantId },
      });

      if (!isFormTeacher && !isSubjectTeacher)
        return res.status(403).json({ success: false, message: 'Not authorized to view this student’s report card' });
    }

    // Fetch grades
    const gradeWhere = { studentId, tenantId };
    if (semester) gradeWhere.semester = semester;
    if (academicYear) gradeWhere.academicYear = academicYear;

    const grades = await AcademicRecord.findAll({
      where: gradeWhere,
      include: [
        { model: Exam, as: 'exam' },
        { model: Subject, as: 'subject' },
      ],
    });

    // Fetch attendance
    const attendanceWhere = { studentId, tenantId };
    if (semester || academicYear) {
      const exams = await Exam.findAll({
        where: { tenantId, ...(semester && { semester }), ...(academicYear && { academicYear }) },
        attributes: ['date'],
      });
      if (exams.length) {
        const dates = exams.map(e => e.date);
        attendanceWhere.date = { [Op.between]: [Math.min(...dates), Math.max(...dates)] };
      }
    }

    const attendanceRecords = await AttendanceRecord.findAll({
      where: attendanceWhere,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count'],
      ],
      group: ['status'],
    });

    // Ensure all statuses exist
    const allStatuses = ['present', 'absent', 'late', 'excused'];
    const attendance = allStatuses.reduce((acc, status) => {
      const record = attendanceRecords.find(a => a.status === status);
      acc[status] = record ? parseInt(record.dataValues.count, 10) : 0;
      return acc;
    }, {});

    const reportCard = {
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        classId: student.classId,
      },
      grades: grades.map(g => ({
        subject: g.subject?.name,
        exam: g.exam?.name,
        grade: g.grade,
        maxScore: g.exam?.maxScore,
        semester: g.semester,
        academicYear: g.academicYear,
      })),
      attendance,
    };

    logger.info('Report card generated', { studentId, tenantId });
    res.json({ success: true, message: 'Report card generated', data: reportCard });

  } catch (error) {
    logger.error('Error generating report card', error);
    res.status(500).json({ success: false, message: 'Error generating report card' });
  }
};

const getClassReport = async (req, res) => {
  try {
    const { error } = validateClassReport(req.query);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { classId, subjectId, semester, academicYear } = req.query;
    const tenantId = req.user.tenantId;
    const role = req.user.role;
    const userId = req.user.userId;

    // Validate class
    const classResponse = await axios.get(
      `${process.env.CLASSROOM_SERVICE_URL}/api/classroom/classes/${classId}`,
      { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
    );
    const classRecord = classResponse.data;
    if (!classRecord) return res.status(404).json({ success: false, message: 'Class not found' });

    // Teacher permission
    if (role === 'teacher') {
      const teacherResponse = await axios.get(
        `${process.env.STUDENT_SERVICE_URL}/api/students/teachers?userId=${userId}`,
        { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
      );
      const teacher = teacherResponse.data;
      if (!teacher) return res.status(403).json({ success: false, message: 'Teacher not found' });

      const isFormTeacher = classRecord.formTeacherId === teacher.id;
      const isSubjectTeacher = subjectId
        ? await sequelize.models.TeacherSubject.findOne({ where: { teacherId: teacher.id, classId, subjectId, tenantId } })
        : await sequelize.models.TeacherSubject.findOne({ where: { teacherId: teacher.id, classId, tenantId } });

      if (!isFormTeacher && !isSubjectTeacher)
        return res.status(403).json({ success: false, message: 'Not authorized for this class/subject' });
    }

    // Fetch students
    const studentsResponse = await axios.get(
      `${process.env.STUDENT_SERVICE_URL}/api/students?classId=${classId}`,
      { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
    );
    const studentIds = studentsResponse.data.map(s => s.id);

    // Fetch grades
    const gradeWhere = { tenantId, studentId: studentIds };
    if (subjectId) gradeWhere.subjectId = parseInt(subjectId, 10);
    if (semester) gradeWhere.semester = semester;
    if (academicYear) gradeWhere.academicYear = academicYear;

    const grades = await sequelize.models.AcademicRecord.findAll({
      where: gradeWhere,
      include: [
        { model: sequelize.models.Exam, as: 'exam' },
        { model: sequelize.models.Subject, as: 'subject' },
      ],
    });

    // Calculate averages
    const subjectAverages = {};
    grades.forEach(g => {
      if (!subjectAverages[g.subjectId]) subjectAverages[g.subjectId] = { total: 0, count: 0, name: g.subject?.name };
      const gradeValue = parseFloat(g.grade);
      if (!isNaN(gradeValue)) {
        subjectAverages[g.subjectId].total += gradeValue;
        subjectAverages[g.subjectId].count += 1;
      }
    });
    const averages = Object.values(subjectAverages).map(s => ({
      subject: s.name,
      average: s.count > 0 ? (s.total / s.count).toFixed(2) : null,
    }));

    // Fetch attendance
    const attendanceWhere = { tenantId, studentId: studentIds };
    if (subjectId) attendanceWhere.subjectId = parseInt(subjectId, 10);
    if (semester || academicYear) {
      const exams = await sequelize.models.Exam.findAll({
        where: { tenantId, classId, ...(subjectId && { subjectId }), ...(semester && { semester }), ...(academicYear && { academicYear }) },
        attributes: ['date'],
      });
      if (exams.length) {
        const dates = exams.map(e => e.date);
        attendanceWhere.date = { [Op.between]: [Math.min(...dates), Math.max(...dates)] };
      }
    }

    const attendanceRecords = await sequelize.models.AttendanceRecord.findAll({
      where: attendanceWhere,
      attributes: [
        'studentId',
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count'],
      ],
      group: ['studentId', 'status'],
    });

    // Build attendance summary with all statuses
    const allStatuses = ['present', 'absent', 'late', 'excused'];
    const attendanceSummary = studentsResponse.data.map(student => {
      const studentAttendance = attendanceRecords.filter(a => a.studentId === student.id);
      const attendance = allStatuses.reduce((acc, status) => {
        const record = studentAttendance.find(a => a.status === status);
        acc[status] = record ? parseInt(record.dataValues.count, 10) : 0;
        return acc;
      }, {});
      return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        attendance,
      };
    });

    const classReport = {
      class: { id: classId, name: classRecord.name },
      students: studentsResponse.data.map(s => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        grades: grades.filter(g => g.studentId === s.id).map(g => ({
          subject: g.subject?.name,
          exam: g.exam?.name,
          grade: g.grade,
          maxScore: g.exam?.maxScore,
        })),
      })),
      averages,
      attendance: attendanceSummary,
    };

    logger.info('Class report generated', { classId, tenantId });
    res.json({ success: true, message: 'Class report generated', data: classReport });

  } catch (error) {
    logger.error('Error generating class report', error);
    res.status(500).json({ success: false, message: 'Error generating class report' });
  }
};


const getAttendanceReport = async (req, res) => {
  try {
    // 1️⃣ Validate query parameters
    const { error } = validateAttendanceReport(req.query);
    if (error) 
      return res.status(400).json({ success: false, message: error.details[0].message });

    const { studentId, classId, subjectId, startDate, endDate } = req.query;
    const tenantId = req.user.tenantId;
    const role = req.user.role;
    const userId = req.user.userId;

    // 2️⃣ Build where clause for AttendanceRecord
    const where = { tenantId };
    if (studentId) where.studentId = parseInt(studentId, 10);
    if (subjectId) where.subjectId = parseInt(subjectId, 10);
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate).toISOString().split('T')[0];
      if (endDate) where.date[Op.lte] = new Date(endDate).toISOString().split('T')[0];
    }

    // 3️⃣ Handle classId: fetch student IDs if class is provided
    let studentIds = null;
    if (classId) {
      const classResponse = await axios.get(
        `${process.env.CLASSROOM_SERVICE_URL}/api/classroom/classes/${classId}`,
        { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
      );
      if (!classResponse.data) 
        return res.status(404).json({ success: false, message: 'Class not found' });

      const students = await axios.get(
        `${process.env.STUDENT_SERVICE_URL}/api/students?classId=${classId}`,
        { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
      );
      studentIds = students.data.map(s => s.id);
      where.studentId = studentIds;
    }

    // 4️⃣ Check teacher permissions
    if (role === 'teacher') {
      const teacherResponse = await axios.get(
        `${process.env.STUDENT_SERVICE_URL}/api/students/teachers?userId=${userId}`,
        { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
      );
      const teacher = teacherResponse.data;
      if (!teacher) 
        return res.status(403).json({ success: false, message: 'Teacher not found' });

      const allowedClasses = await sequelize.models.Class.findAll({
        where: { formTeacherId: teacher.id, tenantId },
        attributes: ['id'],
      });
      const allowedTeacherSubjects = await sequelize.models.TeacherSubject.findAll({
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

    // 5️⃣ Fetch attendance grouped by studentId and status
    const attendanceRecords = await sequelize.models.AttendanceRecord.findAll({
      where,
      attributes: [
        'studentId',
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count'],
      ],
      group: ['studentId', 'status'],
    });

    // 6️⃣ Fetch students (single or multiple)
    const students = studentId
      ? await axios.get(
          `${process.env.STUDENT_SERVICE_URL}/api/students/${studentId}`,
          { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
        )
      : await axios.get(
          `${process.env.STUDENT_SERVICE_URL}/api/students${classId ? `?classId=${classId}` : ''}`,
          { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
        );

    const studentData = Array.isArray(students.data) ? students.data : [students.data];

    // 7️⃣ Build attendance report with all statuses defaulted to 0
    const allStatuses = ['present', 'absent', 'late', 'excused'];
    const attendanceReport = studentData.map(student => {
      // Filter attendance records for this student
      const studentAttendance = attendanceRecords.filter(a => a.studentId === student.id);
      // Reduce to an object with counts, default 0
      const attendance = allStatuses.reduce((acc, status) => {
        const record = studentAttendance.find(a => a.status === status);
        acc[status] = record ? parseInt(record.dataValues.count, 10) : 0;
        return acc;
      }, {});
      return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        attendance,
      };
    });

    logger.info('Attendance report generated', { tenantId, classId, studentId });
    res.json({ success: true, message: 'Attendance report generated', data: attendanceReport });

  } catch (error) {
    logger.error('Error generating attendance report', error);
    res.status(500).json({ success: false, message: 'Error generating attendance report' });
  }
};


module.exports = {
  getReportCard,
  getClassReport,
  getAttendanceReport,
};