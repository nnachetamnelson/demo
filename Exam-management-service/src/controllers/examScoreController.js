// controllers/examScoreController.js
const ExamComponentResult = require('../models/ExamComponentResult');

const addStudentScores = async (req, res) => {
  try {
    const { scores } = req.body; // [{ studentId, componentId, score }]

    for (const s of scores) {
      await ExamComponentResult.upsert({
        studentId: s.studentId,
        componentId: s.componentId,
        score: s.score
      });
    }

    res.status(201).json({ success: true, message: 'Student scores saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error saving scores' });
  }
};

module.exports = { addStudentScores };
