
const router = require('express').Router();
const Auth = require("./controller/authController");
const User = require("./controller/userController");
const UserAttempt = require("./controller/userAttemptController");
const Leaderboard = require("./controller/leaderboardController");
const Matching = require("./controller/matchingController");
const { authMiddleware } = require("./middleware/auth");

// Authentication routes (upstream priority)
router.post("/auth/register", Auth.register);
router.post("/auth/verifyOtp", Auth.verifyOTP);
router.post("/auth/resendOtp", Auth.resendOTP);
router.post("/auth/login", Auth.login);
router.post("/auth/firebase", Auth.upsertFirebase);

// User routes
router.get("/user/:userId", authMiddleware, User.getUserById);
router.put("/user/updateUsername", authMiddleware, User.updateUsername);
router.put("/user/updatePassword", authMiddleware, User.updatePassword);
router.post("/user/changeEmail/request", authMiddleware, User.requestEmailChange);
router.post("/user/changeEmail/verify", authMiddleware, User.verifyEmailChange);
router.delete("/user/delete", authMiddleware, User.deleteAccount);

// User Question Attempt routes
router.post("/attempt", authMiddleware, UserAttempt.saveAttempt);
router.get("/attempt", authMiddleware, UserAttempt.getUserAttempts);
router.get("/attempt/stats", authMiddleware, UserAttempt.getUserStats);

// Leaderboard routes
router.get("/leaderboard", authMiddleware, Leaderboard.getLeaderboard);
router.get("/leaderboard/overall", authMiddleware, (req, res, next) => {
  req.pathType = "overall";
  Leaderboard.getLeaderboard(req, res, next);
});
router.get("/leaderboard/speed", authMiddleware, (req, res, next) => {
  req.pathType = "speed";
  Leaderboard.getLeaderboard(req, res, next);
});
router.get("/leaderboard/streak", authMiddleware, (req, res, next) => {
  req.pathType = "streak";
  Leaderboard.getLeaderboard(req, res, next);
});
router.get("/leaderboard/home", authMiddleware, Leaderboard.getQuickLeaderboard);

// Matching routes
router.post("/matching/start", authMiddleware, Matching.start);
router.get("/matching/:requestId/status", authMiddleware, Matching.status);
router.delete("/matching/:requestId/cancel", authMiddleware, Matching.cancel);

module.exports = router;