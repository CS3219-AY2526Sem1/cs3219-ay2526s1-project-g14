const router = require('express').Router();
const { postUsername, getUsernames } = require('./controller/user');
const { getQuestions } = require('./controller/questionController');

router.get("/user", getUsernames);
router.post("/user", postUsername);
router.get("/questions", getQuestions);

module.exports = router;