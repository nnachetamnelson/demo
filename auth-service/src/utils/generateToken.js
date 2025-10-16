const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken");

/**
 * Generate access & refresh tokens for a user (multi-tenant aware)
 * @param {Object} user - Sequelize User instance
 */
const generateTokens = async (user) => {
  if (!user.tenantId) throw new Error("Tenant ID missing on user");

  // Access token includes tenantId
  const accessToken = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
      tenantId: user.tenantId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "60m" }
  );

  // Refresh token
  const refreshToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  // Store refresh token with tenantId
  await RefreshToken.create({
    token: refreshToken,
    userId: user.id,
    role: user.role,
    tenantId: user.tenantId,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

module.exports = generateTokens;
