// controllers/staffController.js
const Staff = require("../models/Staff");
const Teacher = require("../models/Teacher");
const User = require("../models/User");
const Joi = require("joi");
const { Op } = require("sequelize");
const logger = require("../utils/logger");
// ──────────────────────────────────────────────
// Joi Schema
// ──────────────────────────────────────────────
const staffSchema = Joi.object({
  firstName: Joi.string().required(),
  middleName: Joi.string().allow(null, ""),
  lastName: Joi.string().required(),
  staffId: Joi.string().allow(null, ""),
  email: Joi.string().email().required(),
  phone: Joi.string().allow(null, ""),
  dateOfBirth: Joi.date().allow(null, ""),
  gender: Joi.string().valid("Male", "Female", "Other").allow(null, ""),
  category: Joi.string().valid("Academic", "Non Academic").required(),
  role: Joi.string().required(),
  dateEmployed: Joi.date().allow(null, ""),
  stateOfOrigin: Joi.string().allow(null, ""),
  localGovernmentArea: Joi.string().allow(null, ""),
  homeAddress: Joi.string().allow(null, ""),
  nextOfKinFirstName: Joi.string().allow(null, ""),
  nextOfKinMiddleName: Joi.string().allow(null, ""),
  nextOfKinLastName: Joi.string().allow(null, ""),
  nextOfKinPhone: Joi.string().allow(null, ""),
  nextOfKinOccupation: Joi.string().allow(null, ""),
  nextOfKinRelationship: Joi.string().allow(null, ""),
  nextOfKinAddress: Joi.string().allow(null, ""),
  institution: Joi.string().allow(null, ""),
  courseOfStudy: Joi.string().allow(null, ""),
  yearAdmitted: Joi.string().allow(null, ""),
  yearGraduated: Joi.string().allow(null, ""),
  certificate: Joi.string().allow(null, ""),
  status: Joi.string().valid("active", "inactive").default("active"),
});

// ──────────────────────────────────────────────
// Create Staff
// ──────────────────────────────────────────────
const createStaff = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = staffSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const tenantId = req.user.tenantId;

    // Check if staff already exists
    const existing = await Staff.findOne({ where: { email: value.email, tenantId } });
    if (existing) return res.status(400).json({ success: false, message: "Staff already exists" });

    // Generate staffId using schoolPrefix if available
    const school = await User.findOne({ where: { tenantId, role: "admin" } });

    const lastStaff = await Staff.findOne({
      where: { tenantId },
      order: [["createdAt", "DESC"]],
    });

    const prefix = school?.schoolPrefix?.toUpperCase() || "STAFF";
    let nextNumber = "001";

    if (lastStaff && lastStaff.staffId) {
      const match = lastStaff.staffId.match(/(\d+)$/);
      if (match) nextNumber = (parseInt(match[1], 10) + 1).toString().padStart(3, "0");
    }

    const staffId = `${prefix}-${nextNumber}`;

    // Create Staff record
    const staff = await Staff.create({ ...value, tenantId, staffId });

    // Create linked Teacher record if role includes "teacher"
    if (value.role.toLowerCase().includes("teacher")) {
      const existingTeacher = await Teacher.findOne({
        where: { staffId: staff.id.toString(), tenantId }, // Cast to string
      });

      if (!existingTeacher) {
        await Teacher.create({
          tenantId,
          firstName: value.firstName,
          lastName: value.lastName,
          status: "active",
          staffId: staff.id.toString(), // Cast to string to match DB column
        });
      }
    }

    logger.info(`✅ Staff created successfully (${staff.firstName} ${staff.lastName})`);
    return res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: staff,
    });
  } catch (err) {
    logger.error("❌ Error creating staff:", err);
    return res.status(500).json({ success: false, message: "Error creating staff" });
  }
};


// ──────────────────────────────────────────────
// Get Staff (single or paginated list)
// ──────────────────────────────────────────────
const getStaff = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    // Fetch single staff
    if (id) {
      const staff = await Staff.findOne({ where: { id, tenantId } });
      if (!staff)
        return res.status(404).json({ success: false, message: "Staff not found" });
      return res.status(200).json({ success: true, data: staff });
    }

    // Fetch all with pagination
    let { page = 1, limit = 10, search = "", category } = req.query;
    page = Math.max(parseInt(page) || 1, 1);
    limit = Math.min(parseInt(limit) || 10, 100);

    const whereClause = { tenantId };
    if (category && category !== "All") whereClause.category = category;
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { staffId: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Staff.findAndCountAll({
      where: whereClause,
      offset: (page - 1) * limit,
      limit,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      staff: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    logger.error("❌ Error fetching staff:", error);
    return res.status(500).json({ success: false, message: "Error fetching staff" });
  }
};

// ──────────────────────────────────────────────
// Update Staff
// ──────────────────────────────────────────────
const updateStaff = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;
    const { error, value } = staffSchema.validate(req.body, { allowUnknown: true });
    if (error)
      return res.status(400).json({ success: false, message: error.message });

    const staff = await Staff.findOne({ where: { id, tenantId } });
    if (!staff)
      return res.status(404).json({ success: false, message: "Staff not found" });

    await staff.update(value);

    // Sync Teacher record
    if (value.role?.toLowerCase().includes("teacher")) {
      const teacher = await Teacher.findOne({ where: { staffId: staff.id, tenantId } });
      if (teacher) {
        await teacher.update({
          firstName: value.firstName,
          lastName: value.lastName,
          status: value.status || teacher.status,
        });
      } else {
        await Teacher.create({
          tenantId,
          firstName: value.firstName,
          lastName: value.lastName,
          status: value.status || "active",
          staffId: staff.id,
        });
      }
    } else {
      await Teacher.destroy({ where: { staffId: staff.id, tenantId } });
    }

    logger.info(`✅ Staff updated successfully (ID: ${id})`);
    return res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      data: staff,
    });
  } catch (error) {
    logger.error("❌ Error updating staff:", error);
    return res.status(500).json({ success: false, message: "Error updating staff" });
  }
};

// ──────────────────────────────────────────────
// Delete Staff
// ──────────────────────────────────────────────
const deleteStaff = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    const staff = await Staff.findOne({ where: { id, tenantId } });
    if (!staff)
      return res.status(404).json({ success: false, message: "Staff not found" });

    if (staff.role?.toLowerCase().includes("teacher")) {
      await Teacher.destroy({ where: { staffId: staff.id, tenantId } });
    }

    await staff.destroy();
    logger.info(`🗑️ Staff deleted successfully (ID: ${id})`);

    return res.status(200).json({ success: true, message: "Staff deleted successfully" });
  } catch (error) {
    logger.error("❌ Error deleting staff:", error);
    return res.status(500).json({ success: false, message: "Error deleting staff" });
  }
};

// ──────────────────────────────────────────────
// Deactivate Staff
// ──────────────────────────────────────────────
const deactivateStaff = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    const staff = await Staff.findOne({ where: { id, tenantId } });
    if (!staff)
      return res.status(404).json({ success: false, message: "Staff not found" });

    await staff.update({ status: "inactive" });

    if (staff.role?.toLowerCase().includes("teacher")) {
      await Teacher.update({ status: "inactive" }, { where: { staffId: staff.id, tenantId } });
    }

    return res.status(200).json({ success: true, message: "Staff deactivated successfully" });
  } catch (error) {
    logger.error("❌ Error deactivating staff:", error);
    return res.status(500).json({ success: false, message: "Error deactivating staff" });
  }
};

// ──────────────────────────────────────────────
// Get Teachers Dropdown
// ──────────────────────────────────────────────
const getTeachersDropdown = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const teachers = await Teacher.findAll({
      where: { tenantId },
      attributes: ["id", "firstName", "lastName"],
      order: [["firstName", "ASC"]],
    });

    const formatted = teachers.map((t) => ({
      id: t.id,
      name: `${t.firstName} ${t.lastName}`.trim(),
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    logger.error("❌ Error fetching teachers dropdown:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch teachers dropdown",
    });
  }
};


// ──────────────────────────────────────────────
// Get Teacher(s)
// ──────────────────────────────────────────────
const getTeacher = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    if (id) {
      const teacher = await Teacher.findOne({ where: { id, tenantId } });
      if (!teacher)
        return res.status(404).json({ success: false, message: "Teacher not found" });
      return res.status(200).json({ success: true, data: teacher });
    }

    let { page = 1, limit = 10, search = "" } = req.query;
    page = Math.max(parseInt(page) || 1, 1);
    limit = Math.min(parseInt(limit) || 10, 100);

    const whereClause = { tenantId };
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Teacher.findAndCountAll({
      where: whereClause,
      offset: (page - 1) * limit,
      limit,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      teachers: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    logger.error("❌ Error fetching teacher(s):", error);
    return res.status(500).json({ success: false, message: "Error fetching teacher(s)" });
  }
};

// ──────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────
module.exports = {
  createStaff,
  updateStaff,
  deleteStaff,
  getStaff,
  deactivateStaff,
  getTeacher,
  getTeachersDropdown,
};
