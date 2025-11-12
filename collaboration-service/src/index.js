require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/database');
const socketService = require('./services/socketService');

const PORT = process.env.PORT || 5051;

connectDB();

const server = http.createServer(app);

socketService.initialize(server);

server.listen(PORT, () => {
    console.log(`Collaboration Service running on port ${PORT}`);
});
