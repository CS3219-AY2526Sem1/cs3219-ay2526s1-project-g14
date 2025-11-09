const UserAttempt = require("../models/userAttemptModel.js");
const axios = require("axios");

const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL || "http://localhost:5052";
const COLLABORATION_SERVICE_URL = process.env.COLLABORATION_SERVICE_URL || "http://localhost:5051";

exports.saveAttempt = async (req, res) => {
  try {
    let {
      sessionId,
      questionId,
      code,
      language,
      testCasesPassed,
      totalTestCases,
      timeTaken
    } = req.body;

    console.log("Attempt saved in saveAttempt:", req.body);

    if (!code || code.trim() === "") {
      code = "// No code submitted";
    }
    const userId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (sessionId, code, language)"
      });
    }

    let sessionData;
    try {
      const { data } = await axios.get(
        `${COLLABORATION_SERVICE_URL}/collaboration/session/${sessionId}`,
        {
          headers: {
            Authorization: req.headers.authorization,
          },
        }
      ); sessionData = data?.payload;
      if (!sessionData) throw new Error("Invalid session data");
    } catch (err) {
      console.error("Failed to fetch session:", err.message);
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const { participants = [] } = sessionData;

    if (!participants.length) {
      return res.status(400).json({ success: false, message: "No participants found in session" });
    }

    const participantIds = participants.map((p) =>
      typeof p.userId === "object" ? p.userId._id.toString() : p.userId.toString()
    );

    if (!participantIds.includes(userId)) {
      return res.status(403).json({ success: false, message: "User not part of this session" });
    }

    const passed = totalTestCases > 0 && testCasesPassed === totalTestCases;

    let questionData = null;
    if (questionId) {
      try {
        const { data } = await axios.get(`${QUESTION_SERVICE_URL}/questions/internal/${questionId}`);
        questionData = data?.payload || data;
      } catch (err) {
        console.warn("⚠️ Failed to fetch question info:", err.message);
      }
    }

    const attempts = await Promise.all(
      participants.map((p) =>
        UserAttempt.create({
          sessionId,
          userId: typeof p.userId === "object" ? p.userId._id : p.userId,
          questionId,
          submittedBy: userId,
          code,
          language,
          status: passed,
          testCasesPassed,
          totalTestCases,
          timeTaken,
        })
      )
    );

    console.log(`Recorded ${attempts.length} attempts for session ${sessionId}`);

    res.status(201).json({
      success: true,
      message: "Attempt recorded for all session participants",
      result: attempts,
      question: questionData
        ? {
          id: questionData.questionId,
          title: questionData.title,
          difficulty: questionData.difficulty,
          topic: questionData.topic,
        }
        : null,
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