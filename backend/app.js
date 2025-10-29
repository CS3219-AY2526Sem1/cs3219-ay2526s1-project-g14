const express = require('express');
const cors = require('cors');
const createHttpErrors = require('http-errors');
const router = require('./routes');
const aiRoutes = require('./ai/ai.routes.js');

const app = express();

app.use(cors());
app.use(express.json());
app.use("/ai", aiRoutes);

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
