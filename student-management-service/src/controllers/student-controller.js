const { Sequelize } = require('sequelize');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const AcademicRecord = require('../models/AcademicRecord');
const Club = require('../models/Club');
const StudentClub = require('../models/StudentClub');
const Class = require('../models/Class');
const Level = require('../models/Level');
const Teacher = require('../models/Teacher');
const User = require("../models/User");
const Subject = require('../models/Subject');
const TeacherSubject = require('../models/TeacherSubject');
const logger = require('../utils/logger');
const axios = require('axios');

const {
  validateCreateStudent,
  validateUpdateStudent,
  validateCreateParent,
  validateCreateClub,
  validateAssignClub,
  validateCreateTeacher,
  validateAssignFormTeacher,
  validateAssignSubjectTeacher,
  validateCreateSubject,
} = require('../utils/validation');

/**
 * 🧍‍♂️ Create a new student along with Parent and Academic data (atomic)
 */

const createStudent = async (req, res) => {
  const t = await Student.sequelize.transaction();

  try {
    // 1️⃣ Validate request body
    const { error } = validateCreateStudent(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const tenantId = req.user.tenantId;
    const {
      firstName,
      middleName,
      lastName,
      gender,
      classId,
      dob,
      picture,
      dateAdmitted,
      email,
      stateOfOrigin,
      lga,
      homeAddress,
      previousSchool,
      parentData,
      academic,
    } = req.body;

    // 2️⃣ Ensure the class exists and include level
    let classInstance = null;
    if (classId) {
      classInstance = await Class.findOne({
        where: { id: classId, tenantId },
        include: [{ model: Level, as: "level" }],
        transaction: t,
      });

      if (!classInstance) {
        await t.rollback();
        return res
          .status(404)
          .json({ success: false, message: "Class not found for this tenant" });
      }
    }

    // 3️⃣ Get school prefix
    const school = await User.findOne({ where: { tenantId, role: "admin" }, transaction: t });
    const prefix = school?.schoolPrefix?.toUpperCase() || "STU";

    // 4️⃣ Get year (from admission date or current year)
    const year = (dateAdmitted ? new Date(dateAdmitted) : new Date())
      .getFullYear()
      .toString()
      .slice(-2);

    // 5️⃣ Generate a unique admission number: PREFIX/YY/XXXX
    let admissionNumber;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const candidate = `${prefix}/${year}/${randomNum}`;

      const existingStudent = await Student.findOne({
        where: { admissionNumber: candidate, tenantId },
        transaction: t,
      });

      if (!existingStudent) {
        admissionNumber = candidate;
        isUnique = true;
      } else {
        attempts++;
      }
    }

    if (!isUnique) {
      await t.rollback();
      return res.status(500).json({
        success: false,
        message: "Failed to generate a unique admission number. Please try again.",
      });
    }

    // 6️⃣ Create student record with parents and academic records
    const student = await Student.create(
      {
        tenantId,
        firstName,
        middleName,
        lastName,
        gender,
        admissionNumber,
        classId,
        dob,
        picture,
        dateAdmitted,
        email,
        stateOfOrigin,
        lga,
        homeAddress,
        previousSchool,
        parents:
          parentData && Object.keys(parentData).length
            ? [{ tenantId, ...parentData }]
            : [],
        academicRecords:
          academic && Object.keys(academic).length
            ? [{ tenantId, ...academic }]
            : [],
      },
      {
        include: [
          { model: Parent, as: "parents" },
          { model: AcademicRecord, as: "academicRecords" },
        ],
        transaction: t,
      }
    );

    // 7️⃣ Fetch the student with Class + Level for response
    const studentWithClassAndLevel = await Student.findOne({
      where: { id: student.id },
      include: [
        {
          model: Class,
          as: "class",
          include: [{ model: Level, as: "level" }],
        },
        { model: Parent, as: "parents" },
        { model: AcademicRecord, as: "academicRecords" },
      ],
      transaction: t,
    });

    // 8️⃣ Commit transaction after all operations
    await t.commit();

    logger.info("✅ Student created successfully", { id: student.id, tenantId });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: studentWithClassAndLevel,
    });
  } catch (error) {
    // Rollback only if transaction is still active
    if (!t.finished) {
      await t.rollback();
    }

    logger.error("❌ Error creating student", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Error creating student",
    });
  }
};



/**
 * 🧾 Get student details (with parents, academic records, clubs)
 */
const getStudent = async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const tenantId = req.user.tenantId;

    if (!studentId)
      return res.status(400).json({
        success: false,
        message: 'Invalid studentId',
      });

    const student = await Student.findOne({
      where: { id: studentId, tenantId },
      include: [
        { model: Parent, as: 'parents' },
        { model: AcademicRecord, as: 'academicRecords' },
        { model: Club, through: StudentClub, as: 'clubs' },
      ],
    });

    if (!student)
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });

    res.json({ success: true, data: student });
  } catch (error) {
    logger.error('Error fetching student', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
    });
  }
};

/**
 * 🧰 Update student and optionally parent/academic data
 */
const updateStudent = async (req, res) => {
  const t = await Student.sequelize.transaction();
  try {
    const { error } = validateUpdateStudent(req.body);
    if (error)
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });

    const studentId = Number(req.params.studentId);
    const tenantId = req.user.tenantId;

    if (!studentId)
      return res.status(400).json({
        success: false,
        message: 'Invalid studentId',
      });

    const student = await Student.findOne({
      where: { id: studentId, tenantId },
      include: [
        { model: Parent, as: 'parents' },
        { model: AcademicRecord, as: 'academicRecords' },
      ],
      transaction: t,
    });

    if (!student)
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });

    Object.assign(student, req.body);
    await student.save({ transaction: t });

    if (req.body.parentData) {
      const parentRecords = student.parents || [];
      if (parentRecords.length > 0) {
        await parentRecords[0].update(req.body.parentData, { transaction: t });
      } else {
        await Parent.create(
          { ...req.body.parentData, tenantId, studentId },
          { transaction: t }
        );
      }
    }

    if (req.body.academic) {
      const academicRecords = student.academicRecords || [];
      if (academicRecords.length > 0) {
        await academicRecords[0].update(req.body.academic, { transaction: t });
      } else {
        await AcademicRecord.create(
          { ...req.body.academic, tenantId, studentId },
          { transaction: t }
        );
      }
    }

    await t.commit();

    logger.info('Student updated', { studentId, tenantId });
    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    await t.rollback();
    logger.error('Error updating student', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Error updating student',
    });
  }
};

/**
 * 🗑️ Delete student and cascade remove related data
 */
const deleteStudent = async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const tenantId = req.user.tenantId;

    if (!studentId)
      return res.status(400).json({
        success: false,
        message: 'Invalid studentId',
      });

    const student = await Student.findOne({ where: { id: studentId, tenantId } });
    if (!student)
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });

    await student.destroy();
    logger.info('Student deleted', { studentId, tenantId });
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    logger.error('Error deleting student', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
    });
  }
};

/**
 * 📋 List students with summary info
 */
const listStudents = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { status } = req.query;

    const where = { tenantId };
    if (status) where.status = status;

    const students = await Student.findAll({
      where,
      include: [
        { model: Parent, as: 'parents' },
        { model: AcademicRecord, as: 'academicRecords' },
      ],
    });

    res.json({ success: true, data: students });
  } catch (error) {
    logger.error('Error listing students', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Error listing students',
    });
  }
};

/* ---------- CLUBS, TEACHERS, SUBJECTS ---------- */

const createParent = async (req, res) => {
  try {
    const { error } = validateCreateParent(req.body);
    if (error)
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });

    const {
      studentId,
      fatherName,
      fatherPhone,
      fatherOccupation,
      motherName,
      motherPhone,
      motherOccupation,
      address,
    } = req.body;
    const tenantId = req.user.tenantId;

    const student = await Student.findOne({ where: { id: studentId, tenantId } });
    if (!student)
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });

    const parent = await Parent.create({
      studentId,
      tenantId,
      fatherName,
      fatherPhone,
      fatherOccupation,
      motherName,
      motherPhone,
      motherOccupation,
      address,
    });

    logger.info('Parent created', { studentId, tenantId });
    res
      .status(201)
      .json({ success: true, message: 'Parent created', data: parent });
  } catch (error) {
    logger.error('Error creating parent', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Error creating parent',
    });
  }
};

const createClub = async (req, res) => {
  try {
    const { error } = validateCreateClub(req.body);
    if (error)
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });

    const { name, description } = req.body;
    const tenantId = req.user.tenantId;

    const club = await Club.create({ tenantId, name, description });

    res
      .status(201)
      .json({ success: true, message: 'Club created', data: club });
  } catch (error) {
    logger.error('Error creating club', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Error creating club',
    });
  }
};

const assignClub = async (req, res) => {
  try {
    const { error } = validateAssignClub(req.body);
    if (error)
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });

    const { studentId, clubId } = req.body;
    const tenantId = req.user.tenantId;

    const existing = await StudentClub.findOne({
      where: { studentId, clubId, tenantId },
    });
    if (existing)
      return res.status(400).json({
        success: false,
        message: 'Student already assigned to this club',
      });

    await StudentClub.create({ studentId, clubId, tenantId });
    res.json({ success: true, message: 'Student assigned to club' });
  } catch (error) {
    logger.error('Error assigning club', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Error assigning club',
    });
  }
};

const createTeacher = async (req, res) => {
  try {
    const { error } = validateCreateTeacher(req.body);
    if (error)
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });

    const { userId, firstName, lastName } = req.body;
    const tenantId = req.user.tenantId;

    const teacher = await Teacher.create({
      tenantId,
      userId,
      firstName,
      lastName,
      status: 'active',
    });

    logger.info('Teacher created', { teacherId: teacher.id, tenantId });
    res.status(201).json({
      success: true,
      message: 'Teacher created',
      data: teacher,
    });
  } catch (error) {
    logger.error('Error creating teacher', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Error creating teacher',
    });
  }
};

const assignFormTeacher = async (req, res) => {
  try {
    const { error } = validateAssignFormTeacher(req.body);
    if (error)
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });

    const { teacherId, classId } = req.body;
    const tenantId = req.user.tenantId;

    const teacher = await Teacher.findOne({ where: { id: teacherId, tenantId } });
    if (!teacher)
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });

    const classRecord = await Class.findOne({ where: { id: classId, tenantId } });
    if (!classRecord)
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });

    classRecord.formTeacherId = teacherId;
    await classRecord.save();

    logger.info('Form teacher assigned', { teacherId, classId, tenantId });
    res.json({ success: true, message: 'Form teacher assigned' });
  } catch (error) {
    logger.error('Error assigning form teacher', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Error assigning form teacher',
    });
  }
};

const createSubject = async (req, res) => {
  try {
    const { error } = validateCreateSubject(req.body);
    if (error)
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });

    const { name } = req.body;
    const tenantId = req.user.tenantId;

    const subject = await Subject.create({ tenantId, name });

    logger.info('Subject created', { name, tenantId });
    res.status(201).json({
      success: true,
      message: 'Subject created',
      data: subject,
    });
  } catch (error) {
    logger.error('Error creating subject', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Error creating subject',
    });
  }
};

const assignSubjectTeacher = async (req, res) => {
  try {
    const { error } = validateAssignSubjectTeacher(req.body);
    if (error)
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });

    const { teacherId, subjectId, classId } = req.body;
    const tenantId = req.user.tenantId;

    const teacher = await Teacher.findOne({ where: { id: teacherId, tenantId } });
    if (!teacher)
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });

    const subject = await Subject.findOne({ where: { id: subjectId, tenantId } });
    if (!subject)
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });

    const classRecord = await Class.findOne({ where: { id: classId, tenantId } });
    if (!classRecord)
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });

    const existing = await TeacherSubject.findOne({
      where: { teacherId, subjectId, classId, tenantId },
    });
    if (existing)
      return res.status(400).json({
        success: false,
        message: 'Teacher already assigned to this subject/class',
      });

    await TeacherSubject.create({ teacherId, subjectId, classId, tenantId });
    logger.info('Subject teacher assigned', {
      teacherId,
      subjectId,
      classId,
      tenantId,
    });
    res.json({ success: true, message: 'Subject teacher assigned' });
  } catch (error) {
    logger.error('Error assigning subject teacher', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Error assigning subject teacher',
    });
  }
};

module.exports = {
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
};
