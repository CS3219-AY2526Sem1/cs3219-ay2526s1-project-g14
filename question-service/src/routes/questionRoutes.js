const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/auth');

// Question routes (protected with auth)
router.get("/", authMiddleware, questionController.getQuestions);
router.get("/topics", authMiddleware, questionController.getTopics);

// Internal service routes (no auth required for service-to-service calls)
router.get("/internal/random-question", questionController.getRandomQuestion);
router.get("/internal/:questionId", questionController.getQuestionByQuestionId);

router.get("/last-question-id", questionController.getLastQuestionId);
router.post("/add-question", questionController.addQuestion);

module.exports = router;
