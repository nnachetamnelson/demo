const sequelize = require('./sequelize');

// Import existing model definitions (they will bind to shared sequelize)
const Student = require('../../shared/models/Student');
const Class = require('../../class-management-service/src/models/Class');
const Teacher = require('../../shared/models/Teacher');
const Subject = require('../../shared/models/Subject');
const TeacherSubject = require('../../shared/models/TeacherSubject');
const ClassSubject = require('../../shared/models/ClassSubject');
const Parent = require('../../shared/models/Parent');
const Club = require('../../shared/models/Club');
const StudentClub = require('../../shared/models/StudentClub');
const StudentSubject = require('../../shared/models/StudentSubject');

// Attendance / Exams / Reports shared entities
const AttendanceRecord = require('../../shared/models/AttendanceRecord');
const Exam = require('../../shared/models/Exam');
const AcademicRecord = require('../../shared/models/AcademicRecord');
const ExamSubject = require('../../shared/models/Subject');

// Profiles / Auth
const Profile = require('../../admin-profiles-service/src/models/Profile');
const User = require('../../shared/models/User');
const RefreshToken = require('../../auth-service/src/models/RefreshToken');

// Notifications
const Notification = require('../../Notification-service/src/models/Notification');
const NotificationPreference = require('../../Notification-service/src/models/NotificationPreference');

function applyAssociations() {
	// Students
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

	// Auth
	RefreshToken.belongsTo(User, { foreignKey: 'userId' });

	// Notifications
	Notification.belongsTo(User, { foreignKey: 'userId' });
	NotificationPreference.belongsTo(User, { foreignKey: 'userId' });
}

module.exports = {
	sequelize,
	models: {
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
	},
	applyAssociations,
};


