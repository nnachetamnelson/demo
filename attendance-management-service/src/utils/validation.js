const Joi = require('joi');

const validateCreateAttendance = (data) => {
  return Joi.object({
    studentId: Joi.number().integer().required(),
    classId: Joi.number().integer().required(),
    subjectId: Joi.number().integer().optional(),
    date: Joi.date().required(),
    status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
  }).validate(data);
};

const validateBulkCreateAttendance = (data) => {
  return Joi.object({
    records: Joi.array().items(
      Joi.object({
        studentId: Joi.number().integer().required(),
        classId: Joi.number().integer().required(),
        subjectId: Joi.number().integer().optional(),
        date: Joi.date().required(),
        status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
      })
    ).required(),
  }).validate(data);
};

const validateGetAttendance = (data) => {
  return Joi.object({
    studentId: Joi.number().integer().optional(),
    classId: Joi.number().integer().optional(),
    subjectId: Joi.number().integer().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    status: Joi.string().valid('present', 'absent', 'late', 'excused').optional(),
  }).validate(data);
};

module.exports = {
  validateCreateAttendance,
  validateBulkCreateAttendance,
  validateGetAttendance,
};