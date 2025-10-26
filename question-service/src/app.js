const express = require('express');
const cors = require('cors');
const questionRoutes = require('./routes/questionRoutes');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

app.use('/questions', questionRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'question-service' });
});

module.exports = app;

