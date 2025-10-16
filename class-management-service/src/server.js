require('dotenv').config();
const express = require('express');
const Redis = require('ioredis');
const cors = require('cors');
const helmet = require('helmet');
const classRoutes = require('./routes/class-routes');
const logger = require('./utils/logger');
const sequelize = require('./config/db');
const Student = require('./models/Student');
const Parent = require('./models/Parent');
const AcademicRecord = require('./models/AcademicRecord');
const Club = require('./models/Club');
const StudentClub = require('./models/StudentClub');
const Teacher = require('./models/Teacher');
const Subject = require('./models/Subject');
const TeacherSubject = require('./models/TeacherSubject');
const Class = require('./models/Class');
const ClassSubject = require('./models/ClassSubject');

const app = express();
const PORT = process.env.PORT || 3005;

const redisClient = new Redis(process.env.REDIS_URL);
redisClient.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body: ${JSON.stringify(req.body)}`);
  next();
});

app.use('/api/classroom', (req, res, next) => {
  req.redisClient = redisClient;
  next();
}, classRoutes);

app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: 'Route not found' });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('✅ Connected to MySQL');
    Student.hasMany(Parent, { as: 'parents', foreignKey: 'studentId' });
    Parent.belongsTo(Student, { as: 'student', foreignKey: 'studentId' });
    Student.hasMany(AcademicRecord, { as: 'academicRecords', foreignKey: 'studentId' });
    AcademicRecord.belongsTo(Subject, { as: 'subject', foreignKey: 'subjectId' });
    Student.belongsToMany(Club, { through: StudentClub, as: 'clubs', foreignKey: 'studentId' });
    Club.belongsToMany(Student, { through: StudentClub, foreignKey: 'clubId' });
    Teacher.hasMany(Class, { as: 'classes', foreignKey: 'formTeacherId' });
    Class.belongsTo(Teacher, { as: 'formTeacher', foreignKey: 'formTeacherId' });
    Teacher.belongsToMany(Subject, { through: TeacherSubject, foreignKey: 'teacherId' });
    Subject.belongsToMany(Teacher, { through: TeacherSubject, foreignKey: 'subjectId' });
    // ✅ Student ↔ Class
    Class.hasMany(Student, { as: 'student', foreignKey: 'classId' });
     Student.belongsTo(Class, { as: 'class', foreignKey: 'classId' });

     Class.belongsToMany(Subject, { through: ClassSubject, as: 'subjects', foreignKey: 'classId' });
    Subject.belongsToMany(Class, { through: ClassSubject, as: 'classes', foreignKey: 'subjectId' });

    await sequelize.sync({ force: false });
    logger.info('✅ Database synced');
    app.listen(PORT, () => {
      logger.info(`🚀 class Management service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server', error);
    process.exit(1);
  }
}


startServer();

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});


