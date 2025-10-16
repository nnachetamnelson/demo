// utils/validation.js
const Joi = require("joi");

// ===================== Registration Validation =====================
const validateRegistration = (data) => {
  const schema = Joi.object({
    // Required fields
    tenantId: Joi.string().max(50).required().messages({
      "string.empty": "Tenant ID is required",
    }),

    email: Joi.string().email().max(191).required().messages({
      "string.email": "Email must be a valid email address",
      "string.empty": "Email is required",
    }),

    username: Joi.string().max(191).required().messages({
      "string.empty": "Username is required",
    }),

    password: Joi.string().min(6).max(191).required().messages({
      "string.min": "Password must be at least 6 characters long",
      "string.empty": "Password is required",
    }),

    // Optional fields
    schoolName: Joi.string().max(191).allow(null, "").optional(),
    firstName: Joi.string().max(100).allow(null, "").optional(),
    lastName: Joi.string().max(100).allow(null, "").optional(),
    dateOfBirth: Joi.date().iso().allow(null, "").optional(),
    schoolPrefix: Joi.string().max(100).allow(null, "").optional(),

    // 🆕 Added optional school details
    phoneNo: Joi.string()
      .pattern(/^[0-9+\-\s]*$/)
      .max(20)
      .allow(null, "")
      .optional()
      .messages({
        "string.pattern.base": "Phone number can only contain digits, spaces, + or - signs",
      }),

    phoneNo2: Joi.string()
      .pattern(/^[0-9+\-\s]*$/)
      .max(20)
      .allow(null, "")
      .optional(),

    address: Joi.string().max(255).allow(null, "").optional(),
    website: Joi.string().uri().max(191).allow(null, "").optional(),
    schoolLogo: Joi.string().max(255).uri().allow(null, "").optional(),
    schoolSignature: Joi.string().max(255).uri().allow(null, "").optional(),
    principalSignature: Joi.string().max(255).uri().allow(null, "").optional(),

    // Array of subject IDs (optional)
    subjectIds: Joi.array().items(Joi.number().integer()).optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

// ===================== Login Validation =====================

const validateLogin = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).required(),
    tenantId: Joi.string().min(3).max(50).required(), // required for multi-tenant
  });

  return schema.validate(data);
};
// =======================
// ✏️ Update Schema (Admin/User Edit)
// =======================



const validateUserUpdate = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    phoneNo: Joi.string().optional(),
    phoneNo2: Joi.string().optional(),
    address: Joi.string().optional(),
    website: Joi.string().uri().optional(),
    schoolName: Joi.string().optional(),
    schoolPrefix: Joi.string().max(10).optional(), // ✅ added support here
    schoolLogo: Joi.string().optional(),
    schoolSignature: Joi.string().optional(),
    principalSignature: Joi.string().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    dateOfBirth: Joi.date().optional(),
    status: Joi.string().valid("active", "inactive").optional(),
  });

  return schema.validate(data);
};



// ===================== Refresh Token Validation =====================
const validateRefreshToken = (data) => {
  const schema = Joi.object({
    refreshToken: Joi.string().required(),
    tenantId: Joi.string().min(6).max(50).required(),
  });

  return schema.validate(data);
};

// ===================== Logout Validation =====================
const validateLogout = (data) => {
  const schema = Joi.object({
    refreshToken: Joi.string().required(),
    tenantId: Joi.string().min(6).max(50).required(),
  });

  return schema.validate(data);
};

module.exports = {
  validateRegistration,
  validateUserUpdate,
  validateLogin,
  validateRefreshToken,
  validateLogout,
 
};
