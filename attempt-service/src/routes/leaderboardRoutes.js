const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const authMiddleware = require('../middleware/auth');

// Leaderboard routes
router.get("/", authMiddleware, leaderboardController.getLeaderboard);

router.get("/overall", authMiddleware, (req, res, next) => {
  req.pathType = "overall";
  leaderboardController.getLeaderboard(req, res, next);
});

router.get("/speed", authMiddleware, (req, res, next) => {
  req.pathType = "speed";
  leaderboardController.getLeaderboard(req, res, next);
});

router.get("/streak", authMiddleware, (req, res, next) => {
  req.pathType = "streak";
  leaderboardController.getLeaderboard(req, res, next);
});

router.get("/home", authMiddleware, leaderboardController.getQuickLeaderboard);

module.exports = router;