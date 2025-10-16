const Class = require('../models/Class');
const Subject = require('../models/Subject');
const TeacherSubject = require('../models/TeacherSubject');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Level = require("../models/Level");
const logger = require('../utils/logger');
const {
  validateCreateClass,
  validateUpdateClass,
  validateCreateSubject,
  validateAssignSubjectTeacher,
  validateAssignStudentsToClass,
} = require('../utils/validation');
const { Op } = require("sequelize");


const createClass = async (req, res) => {
  try {
    const { error } = validateCreateClass(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { name, levelId, formTeacherId } = req.body;
    const tenantId = req.user.tenantId;

    // ensure Level exists for this tenant
    const level = await Level.findOne({ where: { id: levelId, tenantId } });
    if (!level) {
      return res.status(404).json({ success: false, message: 'Level not found for this tenant' });
    }

    // check duplicate class name
    const existingClass = await Class.findOne({ where: { tenantId, name } });
    if (existingClass) {
      return res.status(400).json({ success: false, message: 'Class name already exists for this tenant' });
    }

    // validate form teacher if provided
    if (formTeacherId) {
      const teacher = await Teacher.findOne({ where: { id: formTeacherId, tenantId } });
      if (!teacher) {
        return res.status(404).json({ success: false, message: 'Form teacher not found' });
      }
    }

    const newClass = await Class.create({
      tenantId,
      name,
      levelId,
      formTeacherId,
    });

    logger.info('Class created', { name, tenantId });
    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass,
    });
  } catch (error) {
    logger.error('Error creating class', error);
    res.status(500).json({ success: false, message: 'Error creating class' });
  }
};

const getClass = async (req, res) => {
  try {
    const classId = parseInt(req.params.classId, 10);
    const tenantId = req.user.tenantId;
    if (isNaN(classId)) {
      return res.status(400).json({ success: false, message: 'Invalid classId' });
    }

    const classRecord = await Class.findOne({
      where: { id: classId, tenantId },
      include: [
        { model: Teacher, as: 'formTeacher' },
        { model: Student, as: 'student' },
        { model: Subject, through: TeacherSubject, as: 'subjects' },
      ],
    });
    if (!classRecord) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    res.json(classRecord);
  } catch (error) {
    logger.error('Error fetching class', error);
    res.status(500).json({ success: false, message: 'Error fetching class' });
  }
};

const updateClass = async (req, res) => {
  try {
    const { error } = validateUpdateClass(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const classId = parseInt(req.params.classId, 10);
    const tenantId = req.user.tenantId;

    if (isNaN(classId)) {
      return res.status(400).json({ success: false, message: 'Invalid classId' });
    }

    const { name, levelId , formTeacherId } = req.body;

    const classRecord = await Class.findOne({ where: { id: classId, tenantId } });
    if (!classRecord) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Check for duplicate name
    if (name && name !== classRecord.name) {
      const existingClass = await Class.findOne({
        where: { tenantId, name, id: { [Op.ne]: classId } },
      });
      if (existingClass) {
        return res.status(400).json({ success: false, message: 'Class name already exists for this tenant' });
      }
    }

    // Check form teacher validity
    if (formTeacherId) {
      const teacher = await Teacher.findOne({ where: { id: formTeacherId, tenantId } });
      if (!teacher) {
        return res.status(404).json({ success: false, message: 'Form teacher not found' });
      }
    }

    // Apply updates
    classRecord.name = name ?? classRecord.name;
    classRecord.levelId = levelId ?? classRecord.levelId;
    classRecord.formTeacherId = formTeacherId ?? classRecord.formTeacherId;

    await classRecord.save();

    logger.info('Class updated', { classId, tenantId });
    return res.json({ success: true, message: 'Class updated', data: classRecord });

  } catch (error) {
    logger.error('Error updating class', { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: 'Error updating class' });
  }
};


const deleteClass = async (req, res) => {
  try {
    const classId = parseInt(req.params.classId, 10);
    const tenantId = req.user.tenantId;
    if (isNaN(classId)) {
      return res.status(400).json({ success: false, message: 'Invalid classId' });
    }

    const classRecord = await Class.findOne({ where: { id: classId, tenantId } });
    if (!classRecord) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    await classRecord.destroy();
    logger.info('Class deleted', { classId, tenantId });
    res.json({ success: true, message: 'Class deleted' });
  } catch (error) {
    logger.error('Error deleting class', error);
    res.status(500).json({ success: false, message: 'Error deleting class' });
  }
};



const listClasses = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(400).json({ success: false, message: "Tenant ID is required" });
    }

    const classes = await Class.findAll({
      where: { tenantId },
      attributes: ["id", "name"], // only needed for dropdown
      order: [["name", "ASC"]],
    });

    res.status(200).json({
      success: true,
      message: "Classes fetched successfully",
      data: classes,
    });
  } catch (error) {
    logger.error("Error listing classes", error);
    res.status(500).json({
      success: false,
      message: "Error listing classes",
    });
  }
};


const createSubject = async (req, res) => {
  try {
    // ✅ 1. Validate request body
    const { error } = validateCreateSubject(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // ✅ 2. Extract data
    const tenantId = req.user.tenantId;
    const { name, levelId, appliesToAllLevels = false } = req.body;

    // ✅ 3. Optional: Validate that levelId exists (if provided)
    if (!appliesToAllLevels && levelId) {
      const level = await Level.findByPk(levelId);
      if (!level) {
        return res.status(404).json({
          success: false,
          message: 'Level not found',
        });
      }
    }

    // ✅ 4. Check for duplicates (scoped properly)
    const whereClause = {
      tenantId,
      name,
      ...(appliesToAllLevels ? {} : { levelId: levelId || null }),
    };

    const existingSubject = await Subject.findOne({ where: whereClause });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject already exists for this level or tenant',
      });
    }

    // ✅ 5. Create new subject
    const subject = await Subject.create({
      tenantId,
      name,
      levelId: appliesToAllLevels ? null : levelId || null,
      appliesToAllLevels,
    });

    // ✅ 6. Respond
    logger.info('Subject created successfully', { tenantId, name });
    return res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject,
    });

  } catch (error) {
    logger.error('Error creating subject', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating subject',
      error: error.message,
    });
  }
};






// ✅ Update a subject
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, levelId, appliesToAllLevels } = req.body;

    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    await subject.update({
      name: name || subject.name,
      levelId: appliesToAllLevels ? null : levelId,
      appliesToAllLevels,
    });

    res.status(200).json({ success: true, data: subject });
  } catch (err) {
    console.error("Error updating subject:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ✅ Delete a subject
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    await subject.destroy();
    res.status(200).json({ success: true, message: "Subject deleted successfully" });
  } catch (err) {
    console.error("Error deleting subject:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};








const assignSubjectTeacher = async (req, res) => {
  try {
    const { error } = validateAssignSubjectTeacher(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { teacherId, subjectId, classId } = req.body;
    const tenantId = req.user.tenantId;

    const teacher = await Teacher.findOne({ where: { id: teacherId, tenantId } });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const subject = await Subject.findOne({ where: { id: subjectId, tenantId } });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const classRecord = await Class.findOne({ where: { id: classId, tenantId } });
    if (!classRecord) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    await TeacherSubject.create({ teacherId, subjectId, classId, tenantId });
    logger.info('Subject teacher assigned', { teacherId, subjectId, classId, tenantId });
    res.json({ success: true, message: 'Subject teacher assigned' });
  } catch (error) {
    logger.error('Error assigning subject teacher', error);
    res.status(500).json({ success: false, message: 'Error assigning subject teacher' });
  }
};

const assignStudentsToClass = async (req, res) => {
  try {
    const { error } = validateAssignStudentsToClass(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { studentIds, classId } = req.body;
    const tenantId = req.user.tenantId;

    const classRecord = await Class.findOne({ where: { id: classId, tenantId } });
    if (!classRecord) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const students = await Student.findAll({
      where: { id: studentIds, tenantId, status: 'active' },
    });
    if (students.length !== studentIds.length) {
      return res.status(404).json({ success: false, message: 'One or more students not found or inactive' });
    }

    await Student.update(
      { classId },
      { where: { id: studentIds, tenantId } }
    );

    logger.info('Students assigned to class', { studentIds, classId, tenantId });
    res.json({ success: true, message: 'Students assigned to class' });
  } catch (error) {
    logger.error('Error assigning students to class', error);
    res.status(500).json({ success: false, message: 'Error assigning students to class' });
  }
};

const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findByPk(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: `Subject with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    console.error("Error fetching subject:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching subject",
    });
  }
};

// ✅ GET all subjects
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll();

    return res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching subjects",
    });
  }
};

module.exports = {
  createClass,
  getClass,
  updateClass,
  deleteClass,
  listClasses,
  createSubject,
  getSubjectById,
  getAllSubjects,
  assignSubjectTeacher,
  assignStudentsToClass,
  deleteSubject,
   updateSubject,
};