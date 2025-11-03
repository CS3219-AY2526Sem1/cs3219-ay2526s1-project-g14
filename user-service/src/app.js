const express = require('express');
const cors = require('cors');
const createHttpErrors = require('http-errors');
const router = require('./routes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use('/ai', require('./ai/ai.routes'));

app.use('/', router);

// 404 handler
app.use((req, res, next) => {
  next(createHttpErrors(404, `Unknown Resource ${req.method} ${req.originalUrl}`));
});

// handle error
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: error.message || "Unknown Error!",
  });
});

module.exports = app;
