const express = require('express');
const cors = require('cors');
const attemptRoutes = require('./routes/userAttemptRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes')
const healthRoutes = require('./routes/health')

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use('/attempt', attemptRoutes);
app.use('/leaderboard', leaderboardRoutes);

app.use("/health", healthRoutes);

module.exports = app;

