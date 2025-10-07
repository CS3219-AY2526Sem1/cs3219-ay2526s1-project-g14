const router = require('express').Router();
const { getQuestions, getRandomQuestion, getTopics } = require('./controller/questionController');
const Auth = require("./controller/authController");
const { authMiddleware } = require("./middleware/auth");

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

// // Question routes (upstream priority - protected with auth)
router.get("/questions", authMiddleware, getQuestions);
router.get("/questions/random", authMiddleware, getRandomQuestion);
router.get("/topics", authMiddleware, getTopics);

// Collaboration microservice routes (pure microservice API)
router.post("/collaboration/session", createSession);           // External matching service calls this
router.get("/collaboration/session/:sessionId", getSession);
router.put("/collaboration/session/:sessionId/code", updateSessionCode);
router.put("/collaboration/session/:sessionId/end", endSession);
router.get("/collaboration/user/:userId/session", getUserSession);

// Mock matching service routes (REMOVE IN PRODUCTION - for testing only)
// router.post("/matching/queue", joinMatchingQueue);
// router.delete("/matching/queue/:userId", leaveMatchingQueue);
// router.get("/matching/queue/status", getQueueStatus);
// router.post("/matching/users", createMockUser);

module.exports = router;