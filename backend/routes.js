
const router = require('express').Router();
const { getQuestions, getQuestionById, getRandomQuestion, getTopics, getLastQuestionId, addQuestion } = require('./controller/questionController');
const Auth = require("./controller/authController");
const { getUserById } = require('./controller/userController')
const { authMiddleware, checkAdminRole } = require("./middleware/auth");
const Matching = require("./controller/matchingController");

const { 
    createSession, 
    getSession, 
    updateSessionCode, 
    endSession, 
    getUserSession 
} = require('./controller/collaborationController');

// Authentication routes (upstream priority)
router.post("/auth/register", Auth.register);
router.post("/auth/verify-otp", Auth.verifyOTP);
router.post("/auth/resend-otp", Auth.resendOTP);
router.post("/auth/login", Auth.login);
router.post("/auth/firebase", Auth.upsertFirebase);

// User routes
router.get("/user/:userId", authMiddleware, getUserById);

// Question routes (upstream priority - protected with auth)
router.get("/questions", authMiddleware, getQuestions);
router.get("/questions/random-question", authMiddleware, getRandomQuestion);
router.get("/questions/:questionId", authMiddleware, getQuestionById);
router.get("/topics", authMiddleware, getTopics);
router.get("/last-question-id", authMiddleware, getLastQuestionId)
router.post("/add-question", authMiddleware, addQuestion)

// Collaboration microservice routes (pure microservice API)
router.post("/collaboration/session", createSession);           // External matching service calls this
router.get("/collaboration/session/:sessionId", getSession);
router.put("/collaboration/session/:sessionId/code", updateSessionCode);
router.put("/collaboration/session/:sessionId/end", endSession);
router.get("/collaboration/user/:userId/session", getUserSession);

router.post("/matching/start", authMiddleware, Matching.start);
router.get("/matching/:requestId/status", authMiddleware, Matching.status);
router.delete("/matching/:requestId/cancel", authMiddleware, Matching.cancel);

module.exports = router;