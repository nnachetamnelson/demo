const AttendanceRecord = require('../models/AttendanceRecord');
const logger = require('../utils/logger');
const axios = require('axios');
const { Op } = require('sequelize');
const {
  validateCreateAttendance,
  validateBulkCreateAttendance,
  validateGetAttendance,
} = require('../utils/validation');

const createAttendance = async (req, res) => {
  try {
    const { error } = validateCreateAttendance(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { studentId, classId, subjectId, date, status } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    const role = req.user.role;
    
    // Validate student and class
    const studentResponse = await axios.get(
      `${process.env.STUDENT_SERVICE_URL}/api/students/${studentId}`,
      { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
    );
    const student = studentResponse.data;
    if (!student || student.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Active student not found' });
    }

    const classResponse = await axios.get(
      `${process.env.CLASSROOM_SERVICE_URL}/api/classroom/classes/${classId}`,
      { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
    );
    const classRecord = classResponse.data;
    if (!classRecord) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Validate subject (if provided)
    if (subjectId) {
      const subjectResponse = await axios.get(
        `${process.env.CLASSROOM_SERVICE_URL}/api/classroom/subjects/${subjectId}`,
        { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
      );
      if (!subjectResponse.data) {
        return res.status(404).json({ success: false, message: 'Subject not found' });
      }
    }

    // Check permissions for teachers
    if (role === 'teacher') {
      const teacherResponse = await axios.get(
        `${process.env.STUDENT_SERVICE_URL}/api/students/teachers?userId=${userId}`,
        { headers: { Authorization: req.headers.authorization, 'x-tenant-id': tenantId } }
      );
      const teacher = teacherResponse.data;
      if (!teacher) {
        return res.status(403).json({ success: false, message: 'Teacher not found' });
      }

      const isFormTeacher = classRecord.formTeacherId === teacher.id;
      const isSubjectTeacher = subjectId
        ? await TeacherSubject.findOne({ where: { teacherId: teacher.id, subjectId, classId, tenantId } })
        : false;

      if (!isFormTeacher && !isSubjectTeacher) {
        return res.status(403).json({ success: false, message: 'Not authorized to record attendance for this class/subject' });
      }
    }

    // Check if student is in the class
    if (student.classId !== classId) {
      return res.status(400).json({ success: false, message: 'Student not assigned to this class' });
    }

    const existingRecord = await AttendanceRecord.findOne({
      where: { studentId, classId, subjectId, date, tenantId },
    });
    if (existingRecord) {
      return res.status(400).json({ success: false, message: 'Attendance record already exists for this student, class, and date' });
    }

    const attendance = await AttendanceRecord.create({
      studentId,
      classId,
      subjectId,
      tenantId,
      date,
      status,
      recordedBy: userId,
    });

    logger.info('Attendance recorded', { studentId, classId, subjectId, date, tenantId });
    res.status(201).json({ success: true, message: 'Attendance recorded', data: attendance });
  } catch (error) {
    logger.error('Error recording attendance', error);
    res.status(500).json({ success: false, message: 'Error recording attendance' });
  }
};

const bulkCreateAttendance = async (req, res) => {
  try {
    const { error } = validateBulkCreateAttendance(req.body);
    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });

    const { records } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    const role = req.user.role;

    const attendanceRecords = [];

    for (const record of records) {
      const { studentId, classId, subjectId, date, status } = record;

      // Validate student
      const studentResponse = await axios.get(
        `${process.env.STUDENT_SERVICE_URL}/api/students/${studentId}`,
        {
          headers: {
            Authorization: req.headers.authorization,
            "x-tenant-id": tenantId,
          },
        }
      );
      const student = studentResponse.data;
      if (!student || student.status !== "active") {
        return res.status(404).json({
          success: false,
          message: `Active student not found: ${studentId}`,
        });
      }

      // Validate class
      const classResponse = await axios.get(
        `${process.env.CLASSROOM_SERVICE_URL}/api/classroom/classes/${classId}`,
        {
          headers: {
            Authorization: req.headers.authorization,
            "x-tenant-id": tenantId,
          },
        }
      );
      const classRecord = classResponse.data;
      if (!classRecord) {
        return res
          .status(404)
          .json({ success: false, message: `Class not found: ${classId}` });
      }

      // Validate subject (if provided)
      if (subjectId) {
        const subjectResponse = await axios.get(
          `${process.env.CLASSROOM_SERVICE_URL}/api/classroom/subjects/${subjectId}`,
          {
            headers: {
              Authorization: req.headers.authorization,
              "x-tenant-id": tenantId,
            },
          }
        );
        if (!subjectResponse.data) {
          return res.status(404).json({
            success: false,
            message: `Subject not found: ${subjectId}`,
          });
        }
      }

      // Check permissions for teachers
      if (role === "teacher") {
        const teacherResponse = await axios.get(
          `${process.env.STUDENT_SERVICE_URL}/api/students/teachers?userId=${userId}`,
          {
            headers: {
              Authorization: req.headers.authorization,
              "x-tenant-id": tenantId,
            },
          }
        );
        const teacher = teacherResponse.data;
        if (!teacher) {
          return res
            .status(403)
            .json({ success: false, message: "Teacher not found" });
        }

        const isFormTeacher = classRecord.formTeacherId === teacher.id;
        const isSubjectTeacher = subjectId
          ? await TeacherSubject.findOne({
              where: { teacherId: teacher.id, subjectId, classId, tenantId },
            })
          : false;

        if (!isFormTeacher && !isSubjectTeacher) {
          return res.status(403).json({
            success: false,
            message: `Not authorized for class ${classId}, subject ${subjectId}`,
          });
        }
      }

      // Check if student is in the class
      if (student.classId !== classId) {
        return res.status(400).json({
          success: false,
          message: `Student ${studentId} not assigned to class ${classId}`,
        });
      }

      // ✅ Build dynamic where clause
      const whereClause = { studentId, classId, date, tenantId };
      if (subjectId) {
        whereClause.subjectId = subjectId;
      }

      // Check for existing record
      const existingRecord = await AttendanceRecord.findOne({
        where: whereClause,
      });
      if (existingRecord) {
        return res.status(400).json({
          success: false,
          message: `Attendance already exists for student ${studentId}, class ${classId}, date ${date}`,
        });
      }

      attendanceRecords.push({
        studentId,
        classId,
        subjectId: subjectId || null, // store null if not provided
        tenantId,
        date,
        status,
        recordedBy: userId,
      });
    }

    await AttendanceRecord.bulkCreate(attendanceRecords);
    logger.info("Bulk attendance recorded", {
      count: attendanceRecords.length,
      tenantId,
    });
    res.status(201).json({
      success: true,
      message: "Bulk attendance recorded",
      data: attendanceRecords,
    });
  } catch (error) {
    logger.error("Error recording bulk attendance", error);
    res
      .status(500)
      .json({ success: false, message: "Error recording bulk attendance" });
  }
};


const getAttendance = async (req, res) => {
  try {
    const { error } = validateGetAttendance(req.query);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { studentId, classId, subjectId, startDate, endDate, status } = req.query;
    const tenantId = req.user.tenantId;
    const role = req.user.role;
    const userId = req.user.userId;

    const where = { tenantId };
    if (studentId) where.studentId = parseInt(studentId, 10);
    if (classId) where.classId = parseInt(classId, 10);
    if (subjectId) where.subjectId = parseInt(subjectId, 10);
    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }

    // Restrict teachers to their classes/subjects
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

      if (classId && !allowedClassIds.includes(parseInt(classId, 10)) && !allowedSubjectClassIds.includes(parseInt(classId, 10))) {
        return res.status(403).json({ success: false, message: 'Not authorized for this class' });
      }
      if (subjectId) {
        const isSubjectTeacher = allowedTeacherSubjects.some(ts => ts.subjectId === parseInt(subjectId, 10) && ts.classId === parseInt(classId, 10));
        if (!isSubjectTeacher) {
          return res.status(403).json({ success: false, message: 'Not authorized for this subject' });
        }
      }
    }

    const attendanceRecords = await AttendanceRecord.findAll({ where });
    res.json(attendanceRecords);
  } catch (error) {
    logger.error('Error fetching attendance', error);
    res.status(500).json({ success: false, message: 'Error fetching attendance' });
  }
};

module.exports = {
  createAttendance,
  bulkCreateAttendance,
  getAttendance,
};
