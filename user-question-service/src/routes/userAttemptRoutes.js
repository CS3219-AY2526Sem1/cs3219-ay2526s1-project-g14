const express = require('express');
const router = express.Router();
const userAttemptController = require('../controllers/userAttemptController');
const authMiddleware = require('../middleware/auth');

router.post("/", authMiddleware, userAttemptController.saveAttempt);
router.get("/", authMiddleware, userAttemptController.getUserAttempts);
router.get("/stats", authMiddleware, userAttemptController.getUserStats);

module.exports = router;