const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;
const router = require('./routes');

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use('/', router);

app.use((req, res, next) => {
    next(
        createHttpErrors(404, `Unknown Resource ${req.method} ${req.originalUrl}`),
    );
});

app.use((error, req, res, next) => {
    return res.status(error.status || 500).json({
        error: error.message || `Unknown Error!`,
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
