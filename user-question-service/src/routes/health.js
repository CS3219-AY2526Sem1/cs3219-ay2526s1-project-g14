const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const router = express.Router();

router.get("/live", (req, res) => {
  return res.json({ question: "live" });
});

router.get("/services", async (req, res) => {
  const serviceStatus = {
    question: "live"
  };

  const dependencies = {
    matching: process.env.MATCHING_SERVICE_URL + "/health/live",
    user: process.env.USER_SERVICE_URL + "/health/live",
    collaboration: process.env.COLLABORATION_SERVICE_URL + "/health/live",
    question: process.env.QUESTION_SERVICE_URL + "/health/live"
  };

  const checks = Object.entries(dependencies).map(async ([name, url]) => {
    try {
      await axios.get(url, { timeout: 1000 });
      serviceStatus[name] = "live";
    } catch {
      serviceStatus[name] = "degraded";
    }
  });

  await Promise.all(checks);

  return res.json(serviceStatus);
});

module.exports = router;
