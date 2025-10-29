require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 5053;

connectDB();

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Attempt Service running on port ${PORT}`);
});
