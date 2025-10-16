const Joi = require('joi');

const validateReportCard = (data) => {
  return Joi.object({
    studentId: Joi.number().integer().required(),
    semester: Joi.string().max(50).optional(),
    academicYear: Joi.string().max(10).optional(),
  }).validate(data);
};

const validateClassReport = (data) => {
  return Joi.object({
    classId: Joi.number().integer().required(),
    subjectId: Joi.number().integer().optional(),
    semester: Joi.string().max(50).optional(),
    academicYear: Joi.string().max(10).optional(),
  }).validate(data);
};

const validateAttendanceReport = (data) => {
  return Joi.object({
    studentId: Joi.number().integer().optional(),
    classId: Joi.number().integer().optional(),
    subjectId: Joi.number().integer().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
  }).validate(data);
};

module.exports = {
  validateReportCard,
  validateClassReport,
  validateAttendanceReport,
};