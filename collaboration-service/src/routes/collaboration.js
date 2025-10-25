const express = require('express');
const router = express.Router();
const collaborationController = require('../controllers/collaborationController');
const authMiddleware = require('../middleware/auth');

router.post('/session', collaborationController.createSession);
router.get('/session/:sessionId', authMiddleware, collaborationController.getSession);
router.put('/session/:sessionId/code', authMiddleware, collaborationController.updateSessionCode);
router.put('/session/:sessionId/end', authMiddleware, collaborationController.endSession);
router.get('/user/:userId/session', collaborationController.getUserSession);

module.exports = router;
