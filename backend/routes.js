const router = require('express').Router();
const { postUsername, getUsernames } = require('./controller/user');
const { getQuestions, getRandomQuestion, getTopics } = require('./controller/questionController');

router.get("/user", getUsernames);
router.post("/user", postUsername);
router.get("/questions", getQuestions);
router.get("/questions/random", getRandomQuestion);
router.get("/topics", getTopics)

module.exports = router;