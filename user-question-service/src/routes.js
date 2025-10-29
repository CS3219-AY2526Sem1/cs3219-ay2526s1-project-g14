
const router = require('express').Router();
const Auth = require("./controller/authController");
const UserAttempt = require("./controller/userAttemptController");
const Leaderboard = require("./controller/leaderboardController");
const Health = require("./controller/healthController");
const { authMiddleware } = require("./middleware/auth");

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

// Health routes
router.get("/health/live", Health.selfCheck);
router.get("/health/services", Health.serviceCheck);

module.exports = router;