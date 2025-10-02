const express = require("express");
const path = require("path");
const healthRouter = require("./matching/routes/health");
const matchesRouter = require("./matching/routes/matches");

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/matching", healthRouter);
app.use("/api/matching", matchesRouter);

module.exports = app;
