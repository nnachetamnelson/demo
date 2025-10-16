const Exam = require('../models/Exam');
const ExamComponent = require('../models/ExamComponent');
const ExamComponentResult = require('../models/ExamComponentResult');
const Student = require('../models/Student');

const generateReport = async (classId) => {
  const students = await Student.findAll({ where: { className: classId } });
  const report = [];

  for (const student of students) {
    const components = await ExamComponentResult.findAll({
      where: { studentId: student.id },
      include: [ExamComponent]
    });

    const totalScore = components.reduce((sum, c) => sum + parseFloat(c.score), 0);
    report.push({ studentId: student.id, studentName: `${student.firstName} ${student.lastName}`, totalScore });
  }

  // Sort by totalScore descending to assign position
  report.sort((a, b) => b.totalScore - a.totalScore);

  report.forEach((r, idx) => { r.position = idx + 1; r.average = r.totalScore; });

  return report;
};

module.exports = generateReport;
