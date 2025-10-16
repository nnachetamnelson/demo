// routes/examRoutes.js
const express = require('express');
const router = express.Router();
const { createExamWithAutoCAs } = require('../controllers/examController');

router.post('/create-auto', createExamWithAutoCAs);

module.exports = router;



