// server.js
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const logger = require("./utils/logger");
const authRoutes = require("./routes/auth-service"); 
const errorHandler = require("./middleware/errorHandler");
const sequelize = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3001;

// ===================== Database =====================
sequelize
  .authenticate()
  .then(() => {
    logger.info("Connected to MySQL ✅");
    return sequelize.sync({ alter: true }); // safely updates schema without breaking unique keys
  })
  .catch((err) => logger.error("MySQL connection error ❌", err));

// ===================== Redis =====================
const redisClient = new Redis(process.env.REDIS_URL);

// ===================== Middleware =====================
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} ${req.url}`);
  next();
});

// ===================== Global Rate Limiter =====================
const globalLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10, // 10 requests per duration
  duration: 1, // per second
});

app.use((req, res, next) => {
  globalLimiter.consume(req.ip)
    .then(() => next())
    .catch(() => res.status(429).json({ success: false, message: "Too many requests" }));
});

// ===================== Sensitive Endpoints Limiter =====================
const sensitiveEndpointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  store: new RedisStore({ sendCommand: (...args) => redisClient.call(...args) }),
});

app.use("/api/auth/register", sensitiveEndpointsLimiter);

// ===================== Routes =====================
app.use("/api/auth", authRoutes); // tenant-aware routes

// Example protected route
// const { verifyTenantJWT } = require("./middleware/tenantMiddleware");
// app.get("/api/protected", verifyTenantJWT, (req, res) => {
//   res.json({ success: true, message: "Protected route", tenantId: req.tenantId });
// });

// ===================== Error Handler =====================
app.use(errorHandler);

// ===================== Start Server =====================
app.listen(PORT, () => logger.info(`Auth service running on port ${PORT}`));
