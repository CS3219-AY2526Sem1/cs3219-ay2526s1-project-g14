require('dotenv').config();
const app = require('./app');
// const connectDB = require('./config/db'); // Commented out for mock data
const { initializeMockData } = require('./mockData');
const socketService = require('./services/socketService');
const http = require('http');

const PORT = process.env.PORT || 5000;
// connectDB();
// Initialize mock data instead of MongoDB
initializeMockData();

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket service
socketService.initialize(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket service initialized`);
});
