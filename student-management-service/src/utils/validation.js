const Joi = require('joi');

const validateCreateStudent = (data) => {
  return Joi.object({
    firstName: Joi.string().max(100).required(),
    middleName: Joi.string().max(100).allow(null, '').optional(),
    lastName: Joi.string().max(100).required(),
    gender: Joi.string().valid('Male', 'Female', 'Other').required(),
    classId: Joi.number().integer().allow(null).optional(),
    dob: Joi.date().optional().allow(null),
    dateAdmitted: Joi.date().optional().allow(null),
    picture: Joi.string().max(255).optional().allow(null, ''),
    email: Joi.string().email().max(191).optional().allow(null, ''),
    stateOfOrigin: Joi.string().max(100).optional().allow(null, ''),
    lga: Joi.string().max(100).optional().allow(null, ''),
    homeAddress: Joi.string().max(255).optional().allow(null, ''),
    previousSchool: Joi.string().max(191).optional().allow(null, ''),
    status: Joi.string().valid('active', 'graduated', 'deactivated').optional(),
    heightCm: Joi.number().precision(2).optional().allow(null),
    weightKg: Joi.number().precision(2).optional().allow(null),
  }).validate(data);
};


const validateUpdateStudent = (data) => {
  return Joi.object({
    firstName: Joi.string().max(100).optional(),
    middleName: Joi.string().max(100).allow(null, '').optional(),
    lastName: Joi.string().max(100).optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other').optional(),

    dob: Joi.date().optional().allow(null), // ✅ matches your model field name
    dateAdmitted: Joi.date().optional().allow(null),

    picture: Joi.string().max(255).optional().allow(null, ''),
    email: Joi.string().email().max(191).optional().allow(null, ''),
    stateOfOrigin: Joi.string().max(100).optional().allow(null, ''),
    lga: Joi.string().max(100).optional().allow(null, ''),
    homeAddress: Joi.string().max(255).optional().allow(null, ''),
    previousSchool: Joi.string().max(191).optional().allow(null, ''),

    classId: Joi.number().integer().allow(null).optional(), // ✅
    status: Joi.string().valid('active', 'graduated', 'deactivated').optional(),

    heightCm: Joi.number().precision(2).optional().allow(null),
    weightKg: Joi.number().precision(2).optional().allow(null),
  }).validate(data, { abortEarly: false });
};

const validateCreateParent = (data) => {
  return Joi.object({
    studentId: Joi.number().integer().required(),
    firstName: Joi.string().max(191).required(),
    lastName: Joi.string().max(191).required(),
    phone: Joi.string().max(20).optional(),
    email: Joi.string().email().max(191).optional(),
  }).validate(data);
};

const validateCreateClub = (data) => {
  return Joi.object({
    name: Joi.string().max(191).required(),
    description: Joi.string().optional(),
  }).validate(data);
};

const validateAssignClub = (data) => {
  return Joi.object({
    studentId: Joi.number().integer().required(),
    clubId: Joi.number().integer().required(),
  }).validate(data);
};


const validateCreateTeacher = (data) => {
  return Joi.object({
    userId: Joi.number().integer().required(),
    firstName: Joi.string().max(191).required(),
    lastName: Joi.string().max(191).required(),
   
  }).validate(data);
};


const validateAssignFormTeacher = (data) => {
  return Joi.object({
    teacherId: Joi.number().integer().required(),
    classId: Joi.number().integer().required(),
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
  }).validate(data);
};

module.exports = {
  validateCreateStudent,
  validateUpdateStudent,
  validateCreateParent,
  validateCreateClub,
  validateAssignClub,
  validateCreateTeacher,
  validateAssignFormTeacher,
  validateAssignSubjectTeacher,
  validateCreateSubject,
};