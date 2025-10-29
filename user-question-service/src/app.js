const express = require('express');
const cors = require('cors');
const attemptRoutes = require('./routes/userAttemptRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes')

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

app.use('/attempt', attemptRoutes);
app.use('/leaderboard', leaderboardRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'attempt-service' });
});

module.exports = app;

