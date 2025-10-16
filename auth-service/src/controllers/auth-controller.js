const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const logger = require("../utils/logger");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const { validateRegistration, validateUserUpdate, validateLogin } = require("../utils/validation");

const axios = require("axios");


// ===================== Helper: generate tokens =====================
const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    {
      id: user.id, // ✅ use id instead of userId
      username: user.username,
      role: user.role,
      tenantId: user.tenantId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "14d" }
  );

  const refreshToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14); // ✅ 2 weeks

  await RefreshToken.create({
    token: refreshToken,
    userId: user.id,
    role: user.role,
    tenantId: user.tenantId,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

// ===================== Registration =====================
const registerUser = async (req, res) => {
  logger.info("Registration endpoint hit...");

  try {
    // ✅ Validate incoming data
    const { error } = validateRegistration(req.body);
    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });

    // ✅ Extract values from request body
    const {
      email,
      username,
      password,
      tenantId,
      schoolName,
      schoolPrefix,
      phoneNo,
      phoneNo2,
      address,
      website,
      schoolLogo,
      schoolSignature,
      principalSignature,
    } = req.body;

    // ✅ Check if user already exists for this tenant
    const existingUser = await User.findOne({
      where: { tenantId, [Op.or]: [{ email }, { username }] },
    });

    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "User already exists for this tenant" });

    // ✅ Create the new user with extended fields
    const user = await User.create({
      username,
      email,
      password,
      tenantId,
      schoolName,
      schoolPrefix,
      phoneNo: phoneNo || null,
      phoneNo2: phoneNo2 || null,
      address: address || null,
      website: website || null,
      schoolLogo: schoolLogo || null,
      schoolSignature: schoolSignature || null,
      principalSignature: principalSignature || null,
    });

    logger.info(`User created successfully, ID: ${user.id}, Tenant: ${tenantId}`);

    // ✅ Generate access & refresh tokens
    const tokens = await generateTokens(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      tenantId,
      ...tokens,
    });
  } catch (err) {
    logger.error("Registration error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};


// ===================== Login =====================

const loginUser = async (req, res) => {
  try {
    // ✅ Validate login input
    const { error } = validateLogin(req.body);
    if (error) 
      return res.status(400).json({ success: false, message: error.details[0].message });

    const { username, password, tenantId } = req.body;

    // ✅ Find user by username and tenant
    const user = await User.findOne({ where: { username, tenantId } });
    if (!user) 
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // ✅ Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) 
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // ✅ Generate tokens
    const tokens = await generateTokens(user);

    // ✅ Return user info with tokens (no profile service)
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



const getUser = async (req, res) => {
  logger.info("Fetching user...");

  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId; // ✅ from auth middleware

    const user = await User.findOne({ where: { id, tenantId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (err) {
    logger.error("Error fetching user:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


/**
 * ✅ Admin endpoint to update user details
 */
const updateUser = async (req, res) => {
  logger.info("🔧 Admin attempting partial user update...");

  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    // ✅ Validate payload
    const { error, value: validData } = validateUserUpdate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // ✅ Find the user
    const user = await User.findOne({ where: { id, tenantId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found for this tenant" });
    }

    // ✅ Allowed user fields
    const allowedUserFields = [
      "username",
      "email",
      "phoneNo",
      "phoneNo2",
      "address",
      "website",
      "schoolName",
      "schoolPrefix",
      "schoolLogo",
      "schoolSignature",
      "principalSignature",
    ];

    const userUpdates = {};
    for (const field of allowedUserFields) {
      if (validData[field] !== undefined) userUpdates[field] = validData[field];
    }

    if (Object.keys(userUpdates).length > 0) {
      await user.update(userUpdates);
      logger.info(`✅ User ${id} updated successfully`);
    }

    const updatedUser = await User.findOne({ where: { id, tenantId } });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    logger.error("❌ Error updating user:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




// ===================== Refresh Token =====================

const refreshTokenUser = async (req, res) => {
  logger.info("Refresh token endpoint hit...");
  try {
    const { refreshToken, tenantId } = req.body;
    if (!refreshToken || !tenantId)
      return res.status(400).json({ success: false, message: "refreshToken and tenantId required" });

    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken, tenantId },
      include: User,
    });

    if (!storedToken || storedToken.expiresAt < new Date())
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });

    const user = storedToken.User;
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    const tokens = await generateTokens(user);

    // delete old refresh token
    await storedToken.destroy();

    return res.json({ success: true, tenantId, ...tokens });
  } catch (err) {
    logger.error("Refresh token error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// ===================== Logout =====================
const logoutUser = async (req, res) => {
  logger.info("Logout endpoint hit...");
  try {
    const { refreshToken, tenantId } = req.body;
    if (!refreshToken || !tenantId)
      return res.status(400).json({ success: false, message: "refreshToken and tenantId required" });

    const deletedCount = await RefreshToken.destroy({ where: { token: refreshToken, tenantId } });
    if (!deletedCount)
      return res.status(400).json({ success: false, message: "Invalid refresh token" });

    logger.info(`Refresh token deleted for logout, Tenant: ${tenantId}`);
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    logger.error("Logout error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { registerUser, loginUser, refreshTokenUser, updateUser, getUser, logoutUser };



















