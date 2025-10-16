
const Joi = require('joi');

const validateCreateClass = (data) => {
  return Joi.object({
    name: Joi.string().max(191).required(),
    levelId: Joi.number().integer().required(),
    formTeacherId: Joi.number().integer().optional(),
  }).validate(data);
};

const validateUpdateClass = (data) => {
  return Joi.object({
    name: Joi.string().max(191).optional(),
    level: Joi.string().max(191).optional(),
    formTeacherId: Joi.number().integer().optional(),
  }).validate(data);
};

const validateAssignSubjectTeacher = (data) => {
  return Joi.object({
    teacherId: Joi.number().integer().required(),
    subjectId: Joi.number().integer().required(),
    classId: Joi.number().integer().required(),
  }).validate(data);
};

const validateCreateSubject = (data) => {
  return Joi.object({
    name: Joi.string().max(191).required(),
    levelId: Joi.number().integer().allow(null),
    appliesToAllLevels: Joi.boolean().default(false)
  }).validate(data, { allowUnknown: false }); // ensure no other fields are passed
};

const validateAssignStudentsToClass = (data) => {
  return Joi.object({
    studentIds: Joi.array().items(Joi.number().integer()).required(),
    classId: Joi.number().integer().required(),
  }).validate(data);
};

module.exports = {
  validateCreateClass,
  validateUpdateClass,
  validateCreateSubject,
  validateAssignSubjectTeacher,
  validateAssignStudentsToClass,
};
