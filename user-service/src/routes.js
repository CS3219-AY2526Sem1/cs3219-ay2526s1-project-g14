
const router = require('express').Router();
const Auth = require("./controller/authController");
const User = require("./controller/userController");
const Matching = require("./controller/matchingController");
const Health = require("./controller/healthController");
const { authMiddleware } = require("./middleware/auth");

// Authentication routes (upstream priority)
router.post("/auth/register", Auth.register);
router.post("/auth/verifyOtp", Auth.verifyOTP);
router.post("/auth/resendOtp", Auth.resendOTP);
router.post("/auth/login", Auth.login);
router.post("/auth/firebase", Auth.upsertFirebase);

// User routes
router.get("/user/:userId", authMiddleware, User.getUserById);
router.post("/userbulk/batch", authMiddleware, User.getUsersByIds);
router.put("/user/updateUsername", authMiddleware, User.updateUsername);
router.put("/user/updatePassword", authMiddleware, User.updatePassword);
router.post("/user/changeEmail/request", authMiddleware, User.requestEmailChange);
router.post("/user/changeEmail/verify", authMiddleware, User.verifyEmailChange);
router.delete("/user/delete", authMiddleware, User.deleteAccount);

// Health routes
router.get("/health/live", Health.selfCheck);
router.get("/health/services", Health.serviceCheck);

// Matching routes
router.post("/matching/start", authMiddleware, Matching.start);
router.get("/matching/:requestId/status", authMiddleware, Matching.status);
router.delete("/matching/:requestId/cancel", authMiddleware, Matching.cancel);

module.exports = router;