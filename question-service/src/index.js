require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 5052;

connectDB();

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Question Service running on port ${PORT}`);
});
