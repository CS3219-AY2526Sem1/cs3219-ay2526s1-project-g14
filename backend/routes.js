const router = require('express').Router();
const { getQuestions, getRandomQuestion, getTopics } = require('./controller/questionController');
const Auth = require("./controller/authController");
const { authMiddleware } = require("./middleware/auth");

router.post("/auth/register", Auth.register);
router.post("/auth/verify-otp", Auth.verifyOTP);
router.post("/auth/resend-otp", Auth.resendOTP);
router.post("/auth/login", Auth.login);
router.post("/auth/firebase", Auth.upsertFirebase);

router.get("/questions", authMiddleware, getQuestions);
router.get("/questions/random", authMiddleware, getRandomQuestion);
router.get("/topics", authMiddleware, getTopics);

module.exports = router;