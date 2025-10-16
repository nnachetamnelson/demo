const sequelize = require('./sequelize');
const logger = require('../../shared/logger/logger');

// ──────────────────────────────────────────────
// 📦 Import All Models
// ──────────────────────────────────────────────
const Student = require('../../shared/models/Student');
const Class = require('../../class-management-service/src/models/Class');
const Teacher = require('../../shared/models/Teacher');
const Level = require('../../class-management-service/src/models/Level');
const Subject = require('../../shared/models/Subject');
const TeacherSubject = require('../../shared/models/TeacherSubject');
const ClassSubject = require('../../shared/models/ClassSubject');
const Parent = require('../../shared/models/Parent');
const Club = require('../../shared/models/Club');
const StudentClub = require('../../shared/models/StudentClub');
const StudentSubject = require('../../shared/models/StudentSubject');
const AttendanceRecord = require('../../shared/models/AttendanceRecord');
const Exam = require('../../shared/models/Exam');
const AcademicRecord = require('../../shared/models/AcademicRecord');
const ExamSubject = require('../../shared/models/Subject');
const Profile = require('../../admin-profiles-service/src/models/Profile');
const User = require('../../shared/models/User');
const RefreshToken = require('../../auth-service/src/models/RefreshToken');
const Notification = require('../../Notification-service/src/models/Notification');
const NotificationPreference = require('../../Notification-service/src/models/NotificationPreference');
const ExamComponent = require('../../shared/models/ExamComponent');
const ExamComponentResult = require('../../shared/models/ExamComponentResult');

// ──────────────────────────────────────────────
// 🔗 Apply Associations
// ──────────────────────────────────────────────
function applyAssociations() {
  // Students & Parents
  Student.hasMany(Parent, { as: 'parents', foreignKey: 'studentId' });
  Parent.belongsTo(Student, { as: 'student', foreignKey: 'studentId' });

  Student.hasMany(AcademicRecord, { as: 'academicRecords', foreignKey: 'studentId' });
  AcademicRecord.belongsTo(Exam, { as: 'exam', foreignKey: 'examId' });
  AcademicRecord.belongsTo(ExamSubject, { as: 'subject', foreignKey: 'subjectId' });

  Student.belongsToMany(Club, { through: StudentClub, as: 'clubs', foreignKey: 'studentId' });
  Club.belongsToMany(Student, { through: StudentClub, foreignKey: 'clubId' });

  Student.belongsToMany(Subject, { through: StudentSubject, as: 'subjects', foreignKey: 'studentId' });
  Subject.belongsToMany(Student, { through: StudentSubject, as: 'students', foreignKey: 'subjectId' });

  // Teachers / Subjects
  Teacher.belongsToMany(Subject, { through: TeacherSubject, foreignKey: 'teacherId' });
  Subject.belongsToMany(Teacher, { through: TeacherSubject, foreignKey: 'subjectId' });

  // Classes
  Teacher.hasMany(Class, { as: 'classes', foreignKey: 'formTeacherId' });
  Class.belongsTo(Teacher, { as: 'formTeacher', foreignKey: 'formTeacherId' });

  Class.hasMany(Student, { as: 'student', foreignKey: 'classId' });
  Student.belongsTo(Class, { as: 'class', foreignKey: 'classId' });

  Class.belongsToMany(Subject, { through: ClassSubject, as: 'subjects', foreignKey: 'classId' });
  Subject.belongsToMany(Class, { through: ClassSubject, as: 'classes', foreignKey: 'subjectId' });

  // Exams & Components
  Exam.hasMany(ExamComponent, { as: 'components', foreignKey: 'examId', onDelete: 'CASCADE' });
  ExamComponent.belongsTo(Exam, { as: 'exam', foreignKey: 'examId', onDelete: 'CASCADE' });

  ExamComponent.hasMany(ExamComponentResult, { as: 'results', foreignKey: 'componentId', onDelete: 'CASCADE' });
  ExamComponentResult.belongsTo(ExamComponent, { as: 'component', foreignKey: 'componentId', onDelete: 'CASCADE' });

  Student.hasMany(ExamComponentResult, { as: 'componentResults', foreignKey: 'studentId', onDelete: 'CASCADE' });
  ExamComponentResult.belongsTo(Student, { as: 'student', foreignKey: 'studentId', onDelete: 'CASCADE' });

  // Auth
  RefreshToken.belongsTo(User, { foreignKey: 'userId' });

  // Notifications
  Notification.belongsTo(User, { foreignKey: 'userId' });
  NotificationPreference.belongsTo(User, { foreignKey: 'userId' });

  Level.hasMany(Class, { as: 'classes', foreignKey: 'levelId' });
  Class.belongsTo(Level, { as: 'level', foreignKey: 'levelId' });

}

// ──────────────────────────────────────────────
// 🧠 Auto-Detect and Sync Models in Dependency Order
// ──────────────────────────────────────────────
async function syncModelsInOrder(loggerInstance = logger, options = { alter: false, force: false }) {
  const { alter, force } = options;
  const models = sequelize.models;
  const modelNames = Object.keys(models);
  const dependencyGraph = new Map(modelNames.map(name => [name, new Set()]));

  // Build dependency graph based on references
  for (const modelName of modelNames) {
    const model = models[modelName];
    for (const attr of Object.values(model.rawAttributes)) {
      const ref = attr.references?.model;
      if (ref) {
        const dep = typeof ref === 'string' ? ref.replace(/["']/g, '') : ref.name;
        if (models[dep] && dep !== modelName) {
          dependencyGraph.get(modelName).add(dep);
        }
      }
    }
  }

  // Topological sort (handles circulars safely)
  const sorted = [];
  const visited = new Set();

  function visit(model) {
    if (visited.has(model)) return;
    visited.add(model);
    for (const dep of dependencyGraph.get(model)) visit(dep);
    sorted.push(model);
  }

  for (const name of modelNames) visit(name);

  // Remove duplicates and sync in sorted order
  const orderedModels = [...new Set(sorted)];
  for (const name of orderedModels) {
    try {
      const model = models[name];
      await model.sync({ alter, force });
      loggerInstance.info(`✅ Synced model: ${name}`);
    } catch (err) {
      loggerInstance.error(`❌ Failed to sync model: ${name}`, err);
      throw err;
    }
  }

  loggerInstance.info('🎉 All models synced successfully in dependency order.');
}

// ──────────────────────────────────────────────
// 🧾 Exports
// ──────────────────────────────────────────────
module.exports = {
  sequelize,
  models: {
	Level,
    Student,
    Class,
    Teacher,
    Subject,
    TeacherSubject,
    ClassSubject,
    Parent,
    Club,
    StudentClub,
    StudentSubject,
    AttendanceRecord,
    Exam,
    AcademicRecord,
    ExamSubject,
    Profile,
    User,
    RefreshToken,
    Notification,
    NotificationPreference,
    ExamComponent,
    ExamComponentResult,
	
  },
  applyAssociations,
  syncModelsInOrder,
};
