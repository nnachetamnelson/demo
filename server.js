require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// ─────────────────────────────────────────────────────────────
// 📦 ROUTES — Microservices
// ─────────────────────────────────────────────────────────────
const authRoutes = require('./auth-service/src/routes/auth-service');
const publicRoutes = require('./auth-service/src/routes/public-routes');
const profileRoutes = require('./admin-profiles-service/src/routes/profile-routes');
const studentRoutes = require('./student-management-service/src/routes/student-routes');
const classRoutes = require('./class-management-service/src/routes/class-routes');
const attendanceRoutes = require('./attendance-management-service/src/routes/attendance-routes');
const examRoutes = require('./Exam-management-service/src/routes/exam-routes');
const reportRoutes = require('./Report-management-service/src/routes/report-routes');
const notificationRoutes = require('./Notification-service/src/routes/notification-routes');
const portalRoutes = require('./parent-student-portal-service/src/routes/portal-routes');

// ─────────────────────────────────────────────────────────────
// ⚙️ UTILS / MIDDLEWARE
// ─────────────────────────────────────────────────────────────
const gatewayLogger = require('./shared/logger/logger');
const apiAuth = require('./shared/auth/authMiddleware');

// ─────────────────────────────────────────────────────────────
// 🗃️ DATABASE INITIALIZATION
// ─────────────────────────────────────────────────────────────
const { sequelize, models, applyAssociations } = require('./shared/db/models');
const syncModelsInOrder = require('./shared/db/syncModelsInOrder');

// ─────────────────────────────────────────────────────────────
// 🌍 APP CONFIGURATION
// ─────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
	gatewayLogger.info(`➡️ ${req.method} ${req.url}`);
	next();
});

// ─────────────────────────────────────────────────────────────
// 🩺 HEALTH CHECK ENDPOINT
// ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'healthy',
		timestamp: new Date().toISOString(),
		service: 'education-backend',
	});
});

// ─────────────────────────────────────────────────────────────
// 🌐 ROUTES
// ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);

// 🔒 Protected Routes
app.use('/api/profiles', apiAuth.validateToken, profileRoutes);
app.use('/api/students', apiAuth.validateToken, studentRoutes);
app.use('/api/classroom', apiAuth.validateToken, classRoutes);
app.use('/api/attendance', apiAuth.validateToken, attendanceRoutes);
app.use('/api/exams', apiAuth.validateToken, examRoutes);
app.use('/api/reports', apiAuth.validateToken, reportRoutes);
app.use('/api/notifications', apiAuth.validateToken, notificationRoutes);
app.use('/api/portal', apiAuth.validateToken, portalRoutes);

// Legacy v1 compatibility routes
app.use('/v1/profiles', apiAuth.validateToken, profileRoutes);

// 404 handler
app.use((req, res) => {
	res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
	gatewayLogger.error('🔥 Unexpected server error', err);
	res.status(500).json({
		success: false,
		message: 'Internal Server Error',
		error: process.env.NODE_ENV === 'development' ? err.message : undefined,
	});
});

// ─────────────────────────────────────────────────────────────
// 🚀 STARTUP FUNCTION
// ─────────────────────────────────────────────────────────────
async function start() {
	try {
		gatewayLogger.info('⏳ Connecting to shared database...');
		await sequelize.authenticate();
		gatewayLogger.info('✅ Shared database connection established.');

		// Apply all Sequelize associations
		applyAssociations();

		// Sync models in dependency-safe order (optional alter:true)
		const alterSync = process.env.DB_SYNC_ALTER === 'true';
		await syncModelsInOrder(models, gatewayLogger, { alter: alterSync });
		gatewayLogger.info('✅ Models synced successfully.');

		// Start the server
		const server = app.listen(PORT, () => {
			gatewayLogger.info(`🚀 Unified backend running on port ${PORT}`);
		});

		// Graceful shutdown
		process.on('SIGTERM', () => {
			gatewayLogger.info('⛔ SIGTERM received. Closing server gracefully...');
			server.close(() => {
				gatewayLogger.info('✅ Server closed.');
				process.exit(0);
			});
		});

		process.on('SIGINT', () => {
			gatewayLogger.info('⛔ SIGINT received. Exiting...');
			server.close(() => process.exit(0));
		});
	} catch (err) {
		gatewayLogger.error('❌ Failed to start unified backend', err);
		process.exit(1);
	}
}

start();
