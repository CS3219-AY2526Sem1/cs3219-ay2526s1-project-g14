const { Router } = require("express");
const { redis } = require("../lib/redis");
const axios = require("axios");

const r = Router();

// liveness/readiness: confirms Redis connectivity
r.get("/health/live", async (_req, res) => {
  try {
    await redis.ping();
    res.json({ ok: true, redis: "up" });
  } catch (e) {
    res.status(500).json({ ok: false, redis: "down", error: String(e) });
  }
});

r.get("/health/services", async (req, res) => {
  const serviceStatus = {
    matching: "live"
  };

  const dependencies = {
    user: process.env.USER_SERVICE_URL + "/health/live",
    question: process.env.QUESTION_SERVICE_URL + "/health/live",
    collaboration: process.env.COLLABORATION_SERVICE_URL + "/health/live",
    userquestion: process.env.USER_QUESTION_SERVICE_URL + "/health/live"
  };

  const checks = Object.entries(dependencies).map(async ([name, url]) => {
    try {
      await axios.get(url, { timeout: 5000 });
      serviceStatus[name] = "live";
    } catch {
      serviceStatus[name] = "degraded";
    }
  });

  await Promise.all(checks);

  return res.json(serviceStatus);
});
module.exports = r;
