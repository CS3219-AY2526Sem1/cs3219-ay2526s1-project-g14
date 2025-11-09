const axios = require("axios");
const mongoose = require("mongoose");

exports.selfCheck = (req, res) => {
  return res.json({ user: "live" });
};

exports.serviceCheck = async (req, res) => {
  const serviceStatus = { user: "live" };

  const dependencies = {
    collaboration: process.env.COLLABORATION_SERVICE_URL + "/health/live",
    question: process.env.QUESTION_SERVICE_URL + "/health/live",
    matching: process.env.MATCHING_SERVICE_URL + "/health/live",
    userquestion: process.env.USER_QUESTION_SERVICE_URL + "/health/live"
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

  serviceStatus.mongo =
    mongoose.connection.readyState === 1 ? "live" : "degraded";

  return res.json(serviceStatus);
};