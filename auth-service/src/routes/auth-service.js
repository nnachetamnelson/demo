// routes/auth.routes.js
const express = require("express");
const {
  registerUser,
  loginUser,
  refreshTokenUser,
  getUser,
  updateUser,
  logoutUser,
} = require("../controllers/auth-controller");
const { verifyTenantJWT } = require("../middleware/tenantMiddleware"); // tenant-aware JWT middleware

const router = express.Router();

// ===================== Public Routes =====================

// Registration: tenantId will be auto-generated for new schools
router.post("/register", registerUser);

// Login: requires tenantId in body or header
router.post("/login", loginUser);
router.get("/:id", verifyTenantJWT, getUser);


router.patch(
  "/:id",
   verifyTenantJWT,
  updateUser
);

// Refresh token: requires tenantId in body
router.post("/refresh-token", refreshTokenUser);

// Logout: requires tenantId in body
router.post("/logout", logoutUser);

// ===================== Protected Routes Example =====================

// Example: Fetch current user profile (tenant-isolated)
router.get("/profile", verifyTenantJWT, (req, res) => {
  // req.user and req.tenantId are available from middleware
  res.json({
    success: true,
    message: "Tenant-protected route",
    tenantId: req.tenantId,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
    },
  });
});

// Add other protected routes below using verifyTenantJWT

module.exports = router;
