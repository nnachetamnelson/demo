const Joi = require('joi');

const validateUpdateProfile = (data) => {
  return Joi.object({
    bio: Joi.string().optional(),
    profilePicture: Joi.string().uri().optional(),
    role: Joi.string().valid('student', 'admin', 'teacher').optional(),
  }).validate(data);
};

module.exports = { validateUpdateProfile };