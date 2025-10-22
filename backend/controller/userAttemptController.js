const mongoose = require("mongoose");

const UserAttempt = require("../model/userAttemptModel.js");
const Session = require("../model/sessionModel.js");

exports.saveAttempt = async (req, res) => {
  try {
    const {
      sessionId,
      questionId,
      submittedBy,
      code,
      language,
      testCasesPassed = 0,
      totalTestCases = 0,
    } = req.body;
    const userId = req.user.id;

    const session = await Session.findById(sessionId);
    if (!session)
      return res.status(404).json({ success: false, message: "Session not found" });

    const participants = session.participants.map((p) => p.userId.toString());
    if (!participants.includes(userId))
      return res.status(403).json({ success: false, message: "User not part of this session" });

    const timeTaken = Math.round((Date.now() - new Date(session.startTime)) / 1000);
    const passed = totalTestCases > 0 && testCasesPassed === totalTestCases;

    const attempts = await Promise.all(
      participants.map((uid) =>
        UserAttempt.create({
          sessionId,
          userId: uid,
          questionId,
          submittedBy,
          code,
          language,
          status: passed,
          testCasesPassed,
          totalTestCases,
          timeTaken,
        })
      )
    );

    res.status(201).json({
      success: true,
      message: "Attempt recorded for both users",
      result: attempts,
    });
  } catch (err) {
    console.error("Error saving attempt:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getUserAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const attempts = await UserAttempt.find({ userId })
      .populate("questionId", "title difficulty topic")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, result: attempts });
  } catch (err) {
    console.error("Error fetching attempts:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const attempts = await UserAttempt.find({ userId });
    if (!attempts.length)
      return res.status(200).json({
        success: true,
        result: { totalAttempts: 0, passedAttempts: 0, successRate: 0, avgPassingRate: 0, avgTimeToPass: 0 },
      });

    const total = attempts.length;
    const passedAttempts = attempts.filter((a) => a.status).length;
    const successRate = (passedAttempts / total) * 100;
    const avgPassingRate =
      attempts.reduce(
        (sum, a) =>
          sum +
          (a.totalTestCases > 0
            ? (a.testCasesPassed / a.totalTestCases) * 100
            : 0),
        0
      ) / total;
    const avgTimeToPass =
      attempts
        .filter((a) => a.status)
        .reduce((sum, a) => sum + (a.timeTaken || 0), 0) /
        (passedAttempts || 1);

    res.status(200).json({
      success: true,
      result: {
        totalAttempts: total,
        passedAttempts,
        successRate: successRate.toFixed(2),
        avgPassingRate: avgPassingRate.toFixed(2),
        avgTimeToPass: Math.round(avgTimeToPass),
      },
    });
  } catch (err) {
    console.error("Error computing user stats:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};