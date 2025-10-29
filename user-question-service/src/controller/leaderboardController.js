const mongoose = require("mongoose");
const UserAttempt = require("../model/userAttemptModel");
const User = require("../model/userModel");

const DAYS = 30;

const computeScore = (passed, total, avgPassingRate, avgTimeSec, r = 1) => {
  const successRate = total ? passed / total : 0;
  const speedScore = avgTimeSec ? Math.min(300 / avgTimeSec, 1) : 0;
  return (
    (passed * 10 + successRate * 100 + avgPassingRate * 0.5 + speedScore * 50) *
    r
  );
};

async function aggregateBase({ type = "overall", limit = 50 }) {
  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);
  const matchStage = type === "recent" ? { createdAt: { $gte: since } } : {};

  const base = await UserAttempt.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$userId",
        passed: { $sum: { $cond: ["$status", 1, 0] } },
        total: { $sum: 1 },
        avgPassingRate: {
          $avg: {
            $cond: [
              { $gt: ["$totalTestCases", 0] },
              { $multiply: [{ $divide: ["$testCasesPassed", "$totalTestCases"] }, 100] },
              0,
            ],
          },
        },
        avgTime: { $avg: { $ifNull: ["$timeTaken", 9999] } },
        lastAttempt: { $max: "$createdAt" },
        activeDays: { $addToSet: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
      },
    },
    {
      $project: {
        passed: 1,
        total: 1,
        avgPassingRate: 1,
        avgTime: 1,
        lastAttempt: 1,
        activeDaysCount: { $size: "$activeDays" },
      },
    },
  ]);

  const now = Date.now();
  return base.map((s) => {
    const rDays = (now - new Date(s.lastAttempt)) / (1000 * 60 * 60 * 24);
    const rWeight = Math.max(0.5, 1 - rDays / DAYS);

    return {
      ...s,
      rWeight,
      score: computeScore(
        s.passed,
        s.total,
        s.avgPassingRate || 0,
        s.avgTime || 120,
        rWeight
      ),
    };
  });
}

exports.getLeaderboard = async (req, res) => {
  try {
    const type = req.pathType || req.query.type || "overall";
    const limit = 50;
    const results = await aggregateBase({ type, limit });

    const users = await User.find(
      { _id: { $in: results.map((s) => s._id) } },
      { username: 1 }
    ).lean();

    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u.username]));

    console.log(type)
    let sorted;
    if (type === "speed") {
      sorted = results.filter(r => r.avgTime && r.avgTime < 9999)
                      .sort((a, b) => a.avgTime - b.avgTime);
    } else if (type === "streak") {
      sorted = results.sort((a, b) => b.activeDaysCount - a.activeDaysCount);
    } else {
      sorted = results.sort((a, b) => b.score - a.score);
    }

    const result = sorted.slice(0, limit).map((s, i) => ({
      rank: i + 1,
      username: userMap[s._id] || "Unknown",
      totalPassed: s.passed,
      totalAttempts: s.total,
      avgPassingRate: Math.round(s.avgPassingRate || 0),
      avgTimeToPass: Math.round(s.avgTime || 0),
      successRate: s.total ? ((s.passed / s.total) * 100).toFixed(1) : "0.0",
      streakDays: s.activeDaysCount,
      score: Math.round(s.score),
    }));

    console.log(`[${type.toUpperCase()} LEADERBOARD]`, result.map(r => ({
      user: r.username,
      avgTime: r.avgTimeToPass,
      streakDays: r.streakDays,
      score: r.score
    })));

    res.status(200).json({ success: true, result });
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getQuickLeaderboard = async (req, res) => {
  try {
    const userId = req.user?.id;
    const all = await aggregateBase({ type: "overall" });

    if (!all.length) {
      return res.status(200).json({ success: true, result: [] });
    }

    const users = await User.find(
      { _id: { $in: all.map((s) => s._id) } },
      { username: 1 }
    ).lean();

    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u.username]));
    const sorted = all.sort((a, b) => b.score - a.score);

    const ranked = sorted.map((s, i) => ({
      rank: i + 1,
      userId: s._id.toString(),
      username: userMap[s._id] || "Unknown",
      score: Math.round(s.score),
    }));

    const userRank = ranked.findIndex((r) => r.userId === userId);
    let view;

    if (userRank === -1) {
      view = ranked.slice(0, 5);
      return res.status(200).json({
        success: true,
        userPosition: null,
        totalUsers: ranked.length,
        note: "User has no recorded attempts",
        result: view,
      });
    }

    if (userRank <= 1) view = ranked.slice(0, 5);
    else if (userRank >= ranked.length - 2) view = ranked.slice(-5);
    else view = ranked.slice(userRank - 2, userRank + 3);

    res.status(200).json({
      success: true,
      userPosition: userRank + 1,
      totalUsers: ranked.length,
      result: view,
    });
  } catch (err) {
    console.error("Quick leaderboard error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
