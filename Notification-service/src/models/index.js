const User = require('./User');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Parent = require('./Parent');
const Notification = require('./Notification');
const NotificationPreference = require('./NotificationPreference');
const Class = require('./Class');

// ✅ User ↔ Student (1:1)
User.hasOne(Student, { foreignKey: 'userId', onDelete: 'CASCADE' });
Student.belongsTo(User, { foreignKey: 'userId' });

// ✅ User ↔ Teacher (1:1)
User.hasOne(Teacher, { foreignKey: 'userId', onDelete: 'CASCADE' });
Teacher.belongsTo(User, { foreignKey: 'userId' });

// ✅ Student ↔ Parent (1:N)
Student.hasMany(Parent, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Parent.belongsTo(Student, { foreignKey: 'studentId' });

// ⚠️ Class ↔ Student (1:N)
Class.hasMany(Student, { foreignKey: 'classId', onDelete: 'SET NULL' });
Student.belongsTo(Class, { foreignKey: 'classId' });

// ✅ User ↔ Notification (1:N)
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// ✅ Parent ↔ Notification (1:N)  ← NEW for Option B
Parent.hasMany(Notification, { foreignKey: 'parentId', onDelete: 'CASCADE' });
Notification.belongsTo(Parent, { foreignKey: 'parentId' });

// ✅ User ↔ NotificationPreference (1:1)
User.hasOne(NotificationPreference, { foreignKey: 'userId', onDelete: 'CASCADE' });
NotificationPreference.belongsTo(User, { foreignKey: 'userId' });

// 🔑 OPTIONAL: Teacher ↔ Class (many-to-many)
// Teacher.belongsToMany(Class, { through: 'TeacherClasses' });
// Class.belongsToMany(Teacher, { through: 'TeacherClasses' });

module.exports = {
  User,
  Student,
  Teacher,
  Parent,
  Notification,
  NotificationPreference,
  Class,
};
