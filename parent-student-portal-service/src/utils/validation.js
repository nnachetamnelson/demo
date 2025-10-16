const Joi = require('joi');

const validateReportCard = (data) => {
  return Joi.object({
    studentId: Joi.number().integer().required(),
    semester: Joi.string().max(50).optional(),
    academicYear: Joi.string().max(10).optional(),
  }).validate(data);
};

const validateGrades = (data) => {
  return Joi.object({
    studentId: Joi.number().integer().required(),
    semester: Joi.string().max(50).optional(),
    academicYear: Joi.string().max(10).optional(),
  }).validate(data);
};

const validateAttendance = (data) => {
  return Joi.object({
    studentId: Joi.number().integer().required(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
  }).validate(data);
};

const validateParentStudent = (data) => {
  return Joi.object({
    parentId: Joi.number().integer().required(),
    studentId: Joi.number().integer().required(),
  }).validate(data);
};

module.exports = {
  validateReportCard,
  validateGrades,
  validateAttendance,
  validateParentStudent,
};