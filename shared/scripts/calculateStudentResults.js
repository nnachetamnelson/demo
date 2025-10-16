// scripts/calculateStudentResults.js
const sequelize = require('../db/sequelize');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Exam = require('../models/Exam');
const ExamComponent = require('../models/ExamComponent');
const ExamComponentResult = require('../models/ExamComponentResult');
const StudentResult = require('../models/StudentResult');

async function calculateResults(classId, term, session) {
  await sequelize.sync();

  // 1️⃣ Get all students in the class
  const students = await Student.findAll({ where: { classId } });
  if (!students.length) {
    console.log('No students found for this class.');
    return;
  }

  const results = [];

  for (const student of students) {
    // 2️⃣ Fetch all exam components results for this student in this class/term/session
    const exams = await Exam.findAll({ where: { classId } });
    let totalScore = 0;
    let totalMaxScore = 0;

    for (const exam of exams) {
      const components = await ExamComponent.findAll({ where: { examId: exam.id } });

      for (const component of components) {
        const result = await ExamComponentResult.findOne({
          where: { studentId: student.id, componentId: component.id }
        });

        const score = result ? parseFloat(result.score) : 0;
        totalScore += score;
        totalMaxScore += parseFloat(component.maxScore);
      }
    }

    // 3️⃣ Calculate average (percentage)
    const average = totalMaxScore ? (totalScore / totalMaxScore) * 100 : 0;

    results.push({
      studentId: student.id,
      totalScore,
      average: average.toFixed(2),
    });
  }

  // 4️⃣ Sort by average descending to assign positions
  results.sort((a, b) => b.average - a.average);

  results.forEach((res, index) => {
    let position;
    if (index === 0) position = '1st';
    else if (index === 1) position = '2nd';
    else if (index === 2) position = '3rd';
    else position = `${index + 1}th`;
    res.position = position;
  });

  // 5️⃣ Insert/Update into StudentResult
  for (const res of results) {
    await StudentResult.upsert({
      studentId: res.studentId,
      classId,
      term,
      session,
      average: res.average,
      position: res.position,
    });
  }

  console.log(`Results calculated for class ${classId}, term: ${term}, session: ${session}`);
}

// Example usage
calculateResults(1, 'Third', '2024/25')
  .then(() => process.exit())
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
