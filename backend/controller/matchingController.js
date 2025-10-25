const axios = require("axios");
const MATCHING_SERVICE_URL = process.env.MATCHING_SERVICE_URL || "http://localhost:4100/matching";
const COLLABORATION_SERVICE_URL = process.env.COLLABORATION_SERVICE_URL || "http://localhost:5051";

exports.start = async (req, res) => {
  try {
    const { topic, difficulty } = req.body || {};
    if (!topic || !difficulty) return res.status(400).json({ error: "topic and difficulty are required" });

    const user = req.user || {};
    const userId = user.id || user._id || user.userId || user.uid;
    const username = user.username || user.name || user.email || "User";
    if (!userId) return res.status(401).json({ error: "invalid user context" });

    // Check if user has an active session
    try {
      const activeSessionResponse = await axios.get(
        `${COLLABORATION_SERVICE_URL}/collaboration/user/${userId}/session`
      );
      console.log("activeSessionResponse", activeSessionResponse);
      
      const activeSession = activeSessionResponse.data?.payload;
      if (activeSession && (activeSession.status === 'active' || activeSession.status === 'in_progress')) {
        return res.status(409).json({
          success: false,
          error: 'You have an active session',
          sessionId: activeSession.sessionId,
          message: 'Please rejoin or end your current session first'
        });
      }
    } catch (error) {
      // If 404 or error, no active session - continue
      if (error.response?.status !== 404) {
        console.error('Error checking active session:', error.message);
      }
    }

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
