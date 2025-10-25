# Collaboration Service

A real-time collaboration microservice for PeerPrep that enables two users to work together on coding problems with live code editing, chat, and cursor tracking.

## Features

- **Real-time Code Synchronization**: Live code editing with instant updates across both users
- **WebSocket Communication**: Instant updates for code changes, chat messages, and cursor positions
- **Session Management**: Create, join, update, and end collaboration sessions
- **Persistent Storage**: MongoDB-backed session data with chat history
- **Service Integration**: Seamless integration with user and question services
- **Session State Management**: Prevents users from starting new matches while in active sessions

## Architecture

This is a standalone microservice that:
- Manages collaboration sessions independently from the main backend
- Integrates with the main backend for user authentication (JWT)
- Fetches question data from the question service
- Communicates via REST API and WebSocket events
- Stores session data in MongoDB

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Environment variables configured

## Installation

```bash
# Install dependencies
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5051
MONGODB_CONNECTION=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
USER_SERVICE_URL=http://localhost:5050
QUESTION_SERVICE_URL=http://localhost:5050
FRONTEND_URL=http://localhost:3000
```

### Environment Variables Explained

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port the service runs on | `5051` |
| `MONGODB_CONNECTION` | MongoDB connection string | Required |
| `JWT_SECRET` | Secret for JWT token verification | Required |
| `USER_SERVICE_URL` | URL of the user service | `http://localhost:5050` |
| `QUESTION_SERVICE_URL` | URL of the question service | `http://localhost:5050` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 🏃 Running the Service

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The service will be available at `http://localhost:5051`

##  API Documentation

### REST Endpoints

#### 1. Create Collaboration Session
Creates a new collaboration session for two matched users.

```http
POST /collaboration/session
Content-Type: application/json

{
  "users": [
    { "userId": "user_123" },
    { "userId": "user_456" }
  ],
  "difficulty": "Medium",
  "topic": "Arrays",
  "questionData": {
    "questionId": "q_001"  // Optional: specific question
  }
}
```

**Response:**
```json
{
  "success": true,
  "payload": {
    "sessionId": "session_1234567890",
    "session": { /* session object */ },
    "question": { /* question object */ }
  }
}
```

#### 2. Get Session Details
Retrieves full session information including question and participants.

```http
GET /collaboration/session/{sessionId}
Authorization: Bearer {jwt-token}
```

**Response:**
```json
{
  "success": true,
  "payload": {
    "sessionId": "session_123",
    "participants": [
      { "userId": { "_id": "user_123", "username": "Alice" }, "joinedAt": "..." },
      { "userId": { "_id": "user_456", "username": "Bob" }, "joinedAt": "..." }
    ],
    "questionId": { "questionId": "q_001", "title": "Two Sum", /* ... */ },
    "status": "in_progress",
    "code": "function solution() { /* ... */ }",
    "language": "javascript",
    "chatHistory": [ /* ... */ ],
    "startTime": "...",
    "endTime": null
  }
}
```

#### 3. Update Session Code
Updates the session's code and language (REST fallback for WebSocket).

```http
PUT /collaboration/session/{sessionId}/code
Content-Type: application/json
Authorization: Bearer {jwt-token}

{
  "code": "function twoSum(nums, target) { return []; }",
  "language": "javascript"
}
```

#### 4. End Session
Marks a session as completed and notifies all participants via WebSocket.

```http
PUT /collaboration/session/{sessionId}/end
Authorization: Bearer {jwt-token}
```

**Note:** This endpoint broadcasts a `session-ended` event to all users in the session.

#### 5. Get User's Active Session
Checks if a user has an active or in-progress session.

```http
GET /collaboration/user/{userId}/session
```

**Response:**
```json
{
  "success": true,
  "payload": {
    "sessionId": "session_123",
    "status": "active",
    /* ... */
  }
}
```

Returns `null` payload if no active session exists.

#### 6. Health Check
```http
GET /health
```

Returns:
```json
{
  "status": "OK",
  "service": "collaboration-service"
}
```

### WebSocket Events

Connect to the WebSocket server at the same host/port as the REST API.

#### Client → Server Events

**Join Session**
```javascript
socket.emit('join-session', {
    sessionId: 'session_123',
    userId: 'user123',
    username: 'Alice'
});
```

**Send Code Changes**
```javascript
socket.emit('code-change', {
    sessionId: 'session_123',
    code: 'function solution() { return result; }',
    language: 'javascript'
});
```

**Send Chat Message**
```javascript
socket.emit('chat-message', {
    sessionId: 'session_123',
    message: 'What do you think about this approach?'
});
```

**Send Cursor Position**
```javascript
socket.emit('cursor-position', {
    sessionId: 'session_123',
    position: { line: 5, column: 10 }
});
```

**End Session**
```javascript
socket.emit('end-session', {
    sessionId: 'session_123'
});
```

#### Server → Client Events

**User Joined**
```javascript
socket.on('user-joined', (data) => {
    // { userId: 'user456', username: 'Bob', message: 'Bob joined the session' }
});
```

**Session State**
```javascript
socket.on('session-state', (data) => {
    // { session: {...}, connectedUsers: [{id: 'user123', username: 'Alice'}, ...] }
});
```

**Code Updated**
```javascript
socket.on('code-updated', (data) => {
    // { code: '...', language: 'javascript', updatedBy: 'Bob' }
});
```

**Chat Message**
```javascript
socket.on('chat-message', (data) => {
    // { userId: 'user456', username: 'Bob', message: '...', timestamp: '...' }
});
```

**Cursor Updated**
```javascript
socket.on('cursor-updated', (data) => {
    // { userId: 'user456', username: 'Bob', position: { line: 5, column: 10 } }
});
```

**User Left**
```javascript
socket.on('user-left', (data) => {
    // { userId: 'user456', username: 'Bob', message: 'Bob disconnected (can rejoin)' }
});
```

**Session Ended**
```javascript
socket.on('session-ended', (data) => {
    // { endedBy: 'Bob', message: 'Session has been ended' }
});
```

**Session Created** (Global broadcast)
```javascript
socket.on('sessionCreated', (data) => {
    // { sessionId: 'session_123', participants: ['user123', 'user456'], 
    //   topic: 'Arrays', difficulty: 'Medium', questionTitle: 'Two Sum' }
});
```

**Error**
```javascript
socket.on('error', (data) => {
    // { message: 'Error description' }
});
```

## 📊 Data Models

### Session Schema

```javascript
{
  sessionId: String,           // Unique session identifier
  participants: [{
    userId: String,            // User ID (exactly 2 required)
    joinedAt: Date
  }],
  questionId: String,          // Question identifier
  status: String,              // "active" | "in_progress" | "completed" | "cancelled"
  code: String,                // Current code content
  language: String,            // "javascript" | "python" | "java" | "c++"
  chatHistory: [{
    userId: String,
    username: String,
    message: String,
    timestamp: Date
  }],
  startTime: Date,
  endTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔗 Integration Guide

### Matching Service Integration

When users are matched, the matching service should call the collaboration service:

```javascript
// After matching two users
const response = await axios.post('http://collaboration-service:5051/collaboration/session', {
  users: [
    { userId: matchedUser1.id },
    { userId: matchedUser2.id }
  ],
  difficulty: matchRequest.difficulty,
  topic: matchRequest.topic
});

// Notify users of the new session
const { sessionId } = response.data.payload;
```

### Frontend Integration

```javascript
import collaborationService from './services/collaborationService';

// Connect to WebSocket
await collaborationService.connect();

// Join a session
collaborationService.joinSession(sessionId, userId, username);

// Listen for events
collaborationService.socket.on('code-updated', handleCodeUpdate);
collaborationService.socket.on('chat-message', handleChatMessage);

// Send code changes
collaborationService.sendCodeChange(sessionId, code, language);

// Send chat messages
collaborationService.sendChatMessage(sessionId, message);
```

## Project Structure

```
collaboration-service/
├── src/
│   ├── app.js                    # Express app setup
│   ├── index.js                  # Server entry point
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── controllers/
│   │   └── collaborationController.js  # REST API handlers
│   ├── middleware/
│   │   └── auth.js               # JWT authentication
│   ├── models/
│   │   └── sessionModel.js       # Session schema
│   ├── routes/
│   │   └── collaboration.js      # API routes
│   └── services/
│       └── socketService.js      # WebSocket event handlers
├── .env                          # Environment variables
├── .gitignore                    # Git ignore file
├── Dockerfile                    # Docker configuration
├── package.json                  # Dependencies
├── nodemon.json                  # Nodemon configuration
└── README.md                     # This file
```

## 🐛 Error Handling

The service includes comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User not authorized for session
- **404 Not Found**: Session or question not found
- **500 Internal Server Error**: Server-side errors

All errors are logged to the console and returned in a consistent format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

## Session Lifecycle

1. **Created**: Session created by matching service
2. **Active**: Users can join and start collaborating
3. **In Progress**: Code has been modified
4. **Completed**: Session ended by user or timeout
5. **Cancelled**: Session cancelled before completion

## WebSocket Connection Management

- Connections are tracked per session in memory
- Users can disconnect and rejoin without losing session data
- Session state is persisted in MongoDB
- Chat history and code are preserved across reconnections
- When a session ends, all users are notified via WebSocket

## Deployment

### Using Docker

```bash
# Build the image
docker build -t collaboration-service .

# Run the container
docker run -p 5051:5051 \
  -e MONGODB_CONNECTION="your_connection_string" \
  -e JWT_SECRET="your_secret" \
  -e USER_SERVICE_URL="http://user-service:5050" \
  -e QUESTION_SERVICE_URL="http://question-service:5050" \
  collaboration-service
```

### Scaling Considerations

For production deployment with multiple instances:
- Use Redis for WebSocket session management
- Implement sticky sessions or Redis adapter for Socket.IO
- Consider MongoDB replica sets for high availability
- Use load balancer with WebSocket support (e.g., nginx with `proxy_http_version 1.1`)

## Testing

### Manual Testing

1. Start the service: `npm run dev`
2. Use a tool like Postman to test REST endpoints
3. Use a WebSocket client to test real-time features

### Testing WebSocket Connection

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:5051');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  
  socket.emit('join-session', {
    sessionId: 'test_session',
    userId: 'test_user',
    username: 'Test User'
  });
});
```

## Development Notes

### Key Features

- **Exactly 2 participants required**: Sessions validate that exactly 2 users are present
- **Real-time synchronization**: All code changes are broadcast immediately
- **Persistent chat**: Chat history is saved to MongoDB
- **Session recovery**: Users can rejoin sessions after disconnection
- **Automatic cleanup**: Sessions are marked as completed when ended

### Important Behaviors

- **Session ending**: When a user ends a session via REST API, all participants are notified via WebSocket
- **Rejoin prevention**: Frontend prevents users from rejoining completed/cancelled sessions
- **Active session detection**: Users with active sessions see a modal on the home page
- **Route protection**: Invalid collaboration URLs redirect to home page



## Troubleshooting

### MongoDB Connection Issues
- Verify `MONGODB_CONNECTION` is correct
- Check network connectivity
- Ensure MongoDB is running (if local)

### WebSocket Connection Issues
- Check CORS settings in `src/app.js`
- Verify `FRONTEND_URL` environment variable
- Ensure port 5051 is not blocked

### Session Not Found
- Verify session exists in database
- Check sessionId format
- Ensure session status is not 'completed' or 'cancelled'

### JWT Authentication Errors
- Verify `JWT_SECRET` matches the main backend
- Check token format in Authorization header
- Ensure token is not expired



