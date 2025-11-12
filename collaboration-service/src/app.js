const express = require('express');
const cors = require('cors');
const collaborationRoutes = require('./routes/collaboration');
const healthRoutes = require("./routes/health");

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

app.use('/collaboration', collaborationRoutes);
app.use("/health", healthRoutes);

module.exports = app;

