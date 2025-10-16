// controllers/examController.js
const Exam = require('../models/Exam');
const ExamComponent = require('../models/ExamComponent');
const ClassLevelCA = require('../models/ClassLevelCA');

const createExamWithAutoCAs = async (req, res) => {
  try {
    const { classId, classLevel, subjectId, name, date, semester, academicYear, examScore } = req.body;
    const tenantId = req.user.tenantId;

    // Fetch enabled CAs for the class level
    const caSetup = await ClassLevelCA.findAll({ where: { classLevel, enabled: true } });

    // Calculate total max score
    const totalCAMax = caSetup.reduce((sum, ca) => sum + ca.maxScore, 0);
    const totalMaxScore = totalCAMax + examScore;

    // Create Exam
    const exam = await Exam.create({ tenantId, classId, subjectId, name, date, semester, academicYear, maxScore: totalMaxScore });

    // Create ExamComponents for CAs
    for (const ca of caSetup) {
      await ExamComponent.create({ examId: exam.id, name: ca.caption, maxScore: ca.maxScore });
    }

    // Create ExamComponent for Exam Score
    await ExamComponent.create({ examId: exam.id, name: 'Exam', maxScore: examScore });

    res.status(201).json({ success: true, message: 'Exam created with auto-generated CAs', data: exam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error creating exam' });
  }
};

module.exports = { createExamWithAutoCAs };
