const UserAttempt = require("../models/userAttemptModel.js");
const axios = require("axios");

const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL || "http://localhost:5052";

exports.saveAttempt = async (req, res) => {
  try {
    const {
      sessionId,
      participants,
      questionId,
      submittedBy,
      code,
      language,
      testCasesPassed = 0,
      totalTestCases = 0,
      timeTaken
    } = req.body;
    const userId = req.user.id;
    
    if (!participants || !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing participants array",
      });
    }

    const participantIds = participants.map(p => p.userId.toString());
    if (!participantIds.includes(userId)) {
      return res.status(403).json({ success: false, message: "User not part of this session" });
    }

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
    console.log("recorded attempts in attempt controller", attempts)
    
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
      .sort({ createdAt: -1 })
      .lean();

    if (!attempts.length) {
      return res.status(200).json({ success: true, result: [] });
    }

    const questionIds = attempts.map((a) => a.questionId);

    const questionRequests = questionIds.map((id) =>
      axios
        .get(`${QUESTION_SERVICE_URL}/questions/internal/${id}`)
        .then((res) => ({ id, ...res.data }))
        .catch((err) => {
          console.error(`Failed to fetch question ${id}:`, err.message);
          return { id, title: "Unknown", difficulty: "N/A", topic: "N/A" };
        })
    );

    const questions = await Promise.all(questionRequests);
    const questionMap = Object.fromEntries(questions.map((q) => [q.id, q]));

    const merged = attempts.map((a) => ({
      ...a,
      question: questionMap[a.questionId] || null,
    }));

    res.status(200).json({ success: true, result: merged });
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