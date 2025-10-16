const { sequelize, models, applyAssociations } = require('./models');

async function syncDatabase() {
  try {
    applyAssociations(); // Apply all model associations first

    // Sync parent tables first
    await models.Student.sync({ alter: true });
    await models.Class.sync({ alter: true });
    await models.Teacher.sync({ alter: true });
    await models.Subject.sync({ alter: true });
    await models.Club.sync({ alter: true });

    // Sync child tables after parent tables
    await models.Parent.sync({ alter: true });
    await models.AcademicRecord.sync({ alter: true });
    await models.StudentSubject.sync({ alter: true });
    await models.StudentClub.sync({ alter: true });
    await models.TeacherSubject.sync({ alter: true });
    await models.ClassSubject.sync({ alter: true });

    console.log('✅ Database synced successfully');
  } catch (err) {
    console.error('❌ Error syncing database:', err);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
