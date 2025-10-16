const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyTenantJWT = async (req, res, next) => {
  try {
    // ✅ Extract Bearer token
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // ✅ Verify token and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.tenantId || !decoded?.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // ✅ Fetch the user using decoded.id
    const user = await User.findOne({
      where: { id: decoded.id, tenantId: decoded.tenantId },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found for tenant" });
    }

    // ✅ Attach user and tenant to request
    req.user = user;
    req.tenantId = decoded.tenantId;

    next();
  } catch (err) {
    console.error("Tenant JWT verification error:", err);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

module.exports = { verifyTenantJWT };
