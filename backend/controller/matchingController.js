const axios = require("axios");
const MATCHING_SERVICE_URL = process.env.MATCHING_SERVICE_URL || "http://localhost:7070";

exports.start = async (req, res) => {
  try {
    const { topic, difficulty } = req.body || {};
    if (!topic || !difficulty) return res.status(400).json({ error: "topic and difficulty are required" });

    const user = req.user || {};
    const userId = user.id || user._id || user.userId || user.uid;
    const username = user.username || user.name || user.email || "User";
    if (!userId) return res.status(401).json({ error: "invalid user context" });

    const { data } = await axios.post(`${MATCHING_SERVICE_URL}/matches`, {
      userId, username, topic, difficulty
    });
    res.json(data);
  } catch (e) {
    console.error("matching/start error:", e?.response?.data || e.message);
    res.status(500).json({ error: "Failed to start matching" });
  }
};

exports.status = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { data } = await axios.get(`${MATCHING_SERVICE_URL}/matches/${requestId}`);
    res.json(data);
  } catch (e) {
    console.error("matching/status error:", e?.response?.data || e.message);
    res.status(500).json({ error: "Failed to fetch matching status" });
  }
};

exports.cancel = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { data } = await axios.delete(`${MATCHING_SERVICE_URL}/matches/${requestId}`);
    res.json(data);
  } catch (e) {
    console.error("matching/cancel error:", e?.response?.data || e.message);
    res.status(500).json({ error: "Failed to cancel match" });
  }
};
