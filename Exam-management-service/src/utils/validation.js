const Joi = require('joi');

const validateCreateExam = (data) => {
  return Joi.object({
    classId: Joi.number().integer().required(),
    subjectId: Joi.number().integer().required(),
    name: Joi.string().max(191).required(),
    date: Joi.date().required(),
    maxScore: Joi.number().precision(2).required(),
    semester: Joi.string().max(50).optional(),
    academicYear: Joi.string().max(10).optional(),
  }).validate(data);
};

const validateUpdateExam = (data) => {
  return Joi.object({
    name: Joi.string().max(191).optional(),
    date: Joi.date().optional(),
    maxScore: Joi.number().precision(2).optional(),
    semester: Joi.string().max(50).optional(),
    academicYear: Joi.string().max(10).optional(),
  }).validate(data);
};

const validateRecordGrade = (data) => {
  return Joi.object({
    studentId: Joi.number().integer().required(),
    examId: Joi.number().integer().required(),
    grade: Joi.string().max(10).required(),
  }).validate(data);
};

const validateBulkRecordGrade = (data) => {
  return Joi.object({
    records: Joi.array().items(
      Joi.object({
        studentId: Joi.number().integer().required(),
        examId: Joi.number().integer().required(),
        grade: Joi.string().max(10).required(),
      })
    ).required(),
  }).validate(data);
};

const validateGetGrades = (data) => {
  return Joi.object({
    studentId: Joi.number().integer().optional(),
    classId: Joi.number().integer().optional(),
    subjectId: Joi.number().integer().optional(),
    examId: Joi.number().integer().optional(),
    semester: Joi.string().max(50).optional(),
    academicYear: Joi.string().max(10).optional(),
  }).validate(data);
};

module.exports = {
  validateCreateExam,
  validateUpdateExam,
  validateRecordGrade,
  validateBulkRecordGrade,
  validateGetGrades,
};