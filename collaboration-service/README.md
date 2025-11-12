# Collaboration Service

**AI Usage**
This README contains documentation enhanced with AI assistance (GitHub Copilot).
Specific improvements: WebSocket event tables formatting.
See `/ai-usage-log.md` for detailed attribution.

The **Collaboration Service** is a Node.js + Express microservice that enables real-time paired programming sessions with synchronized code editing, live chat, and session management.
- It provides both RESTful APIs for session lifecycle management and WebSocket (Socket.IO) communication for real-time collaboration features.
- This service uses MongoDB (via Mongoose) for persistent storage and maintains in-memory state for active WebSocket connections.

## Features
- Real-time code synchronization between paired users
- Live chat messaging within sessions
- User presence tracking (join/leave notifications)
- Session persistence (code, chat history, timestamps)
- Integration with Question Service and User-Question Service
- JWT authentication for secure access
- Docker-ready for deployment

## Project Structure
```
collaboration-service/
├── src/
│   ├── app.js                          # Express + Socket.IO setup
│   ├── index.js                        # Server entry point
│   ├── config/
│   │   └── database.js                 # MongoDB connection
│   ├── controllers/
│   │   └── collaborationController.js  # REST API handlers
│   ├── middleware/
│   │   └── auth.js                     # JWT authentication middleware
│   ├── models/
│   │   └── sessionModel.js             # Session schema definition
│   ├── routes/
│   │   ├── collaboration.js            # REST API routes
│   │   └── health.js                   # Health check endpoint
│   └── services/
│       └── socketService.js            # WebSocket event handlers
├── Dockerfile                          # Docker build configuration
├── docker-compose.yml                  # Docker compose for local dev
├── package.json                        # Dependencies
├── nodemon.json                        # Dev reload configuration
└── README.md                           # This file
```

## Architecture: REST + WebSocket Hybrid

This service uses a dual-protocol architecture:

**REST API** handles:
- Session creation/retrieval (CRUD operations)
- Operations requiring guaranteed delivery and confirmation
- Integration with other microservices (Matching Service, Question Service, User-Question Service)
- Operations that need HTTP status codes for error handling

**WebSocket** handles:
- Real-time code synchronization (low latency required)
- Chat messages (instant delivery to all participants)
- User presence updates (join/leave notifications)
- Cursor position sharing (high-frequency updates)
- Session end notifications (broadcast to all users simultaneously)

 REST provides reliability for critical operations (creating sessions, saving attempts), while WebSocket enables instant updates for collaborative editing. This follows the same pattern as Google Docs (REST for document management, WebSocket for real-time editing) and Slack (REST for messages/channels, WebSocket for live updates).

**Example:** Session ending uses REST (`PUT /session/:id/end`) to update the database and save attempts, then WebSocket events (`session-ended`, `session-ended-confirmed`) notify both users simultaneously.

## State Management

**Persistent State (MongoDB)**
```javascript
{
  sessionId: UUID,
  participants: [{ userId, username, joinedAt }],
  questionId: String,
  code: String,
  language: String,
  chatHistory: [{ userId, username, message, timestamp }],
  status: 'active' | 'in_progress' | 'completed',
  startTime: Date,
  endTime: Date
}
```

**In-Memory State (Socket Service)**
```javascript
// Map of sessionId -> Set of connected socket IDs
this.sessions = Map<sessionId, Set<socketId>>;

// Per-socket metadata
socket.sessionId = '550e8400-...';
socket.userId = 'user123';
socket.username = 'Alice';
```

MongoDB provides persistent storage that survives restarts, while in-memory state enables fast lookups for real-time connection tracking.

## Environment Variables
Create a `.env` file in the `collaboration-service/` directory:

```bash
# server config
PORT=5051
NODE_ENV=development

# MongoDB config
MONGODB_URI=mongodb://localhost:27017/collaboration-db
# OR for Docker:
# MONGODB_URI=mongodb://mongo:27017/collaboration-db

# JWT config
JWT_SECRET=your-jwt-secret-key-here

# Service URLs
FRONTEND_URL=http://localhost:3000
USER_SERVICE_URL=http://localhost:5050
QUESTION_SERVICE_URL=http://localhost:5052
REACT_APP_USERQUESTION_URL=http://localhost:5054

# CORS config
CORS_ORIGIN=http://localhost:3000
```

For Docker deployment, use service names instead of localhost:
```bash
MONGODB_URI=mongodb://mongo:27017/collaboration-db
USER_SERVICE_URL=http://user-service:5050
QUESTION_SERVICE_URL=http://question-service:5052
```

## API Endpoints

**Base URL:** `http://localhost:5051`

### REST API

| Method | Endpoint                                  | Description                                    | Auth Required |
| ------ | ----------------------------------------- | ---------------------------------------------- | ------------- |
| `GET`  | `/health`                                 | Health check                                   | No            |
| `POST` | `/collaboration/session`                  | Create a new collaboration session             | No            |
| `GET`  | `/collaboration/session/:sessionId`       | Get session details (includes question data)   | Yes (JWT)     |
| `PUT`  | `/collaboration/session/:sessionId/end`   | End session and save attempt                   | Yes (JWT)     |
| `GET`  | `/collaboration/user/:userId/session`     | Check if user has an active session            | No            |

### WebSocket Events (Socket.IO)

**Client → Server**

| Event              | Payload                                          | Description                    |
| ------------------ | ------------------------------------------------ | ------------------------------ |
| `join-session`     | `{ sessionId, userId, username }`                | Join a collaboration session   |
| `code-change`      | `{ sessionId, code, language }`                  | Send code changes              |
| `chat-message`     | `{ sessionId, message }`                         | Send chat message              |

**Server → Client**

| Event                      | Payload                                          | Description                                |
| -------------------------- | ------------------------------------------------ | ------------------------------------------ |
| `sessionCreated`           | `{ sessionId, participants, usernames, ... }`    | New session created (from matching)        |
| `session-state`            | `{ session, connectedUsers }`                    | Current session state and connected users  |
| `user-joined`              | `{ userId, username, message }`                  | User joined the session                    |
| `user-left`                | `{ userId, username, message }`                  | User left the session                      |
| `code-updated`             | `{ code, language, updatedBy }`                  | Code changes from other user               |
| `chat-message`             | `{ userId, username, message, timestamp }`       | Chat message                               |
| `session-ended`            | `{ endedBy, message }`                           | Session has ended (UI notification)        |
| `session-ended-confirmed`  | `{ sessionId, timestamp }`                       | Safe to navigate (sync signal)             |
| `error`                    | `{ message }`                                    | Error notification                         |

**Built-in Socket.IO Events**

| Event        | Direction         | Description                                    |
| ------------ | ----------------- | ---------------------------------------------- |
| `connect`    | Server → Client   | Socket connected successfully                  |
| `disconnect` | Both directions   | Socket disconnected (user closes tab/network)  |

**Note on `session-ended-confirmed`:** This event prevents race conditions by ensuring all cleanup operations (database updates, saving attempts) are complete before users navigate away. Frontend should wait for this confirmation before redirecting.

## Session Lifecycle

**1. Session Creation**
- Matching Service calls `POST /collaboration/session` with matched users
- Controller fetches question from Question Service
- Creates session in MongoDB with empty code
- Emits `sessionCreated` WebSocket event to notify both users
- Returns session data to Matching Service

**2. Joining Session**
- Users navigate to `/collaboration/:sessionId`
- Frontend calls `GET /collaboration/session/:sessionId` to load session details
- Establishes WebSocket connection via `socket.emit('join-session')`
- Server validates user is a participant, adds to room, broadcasts `user-joined` event

**3. Real-time Collaboration**
- Code changes: `socket.emit('code-change')` → persisted to MongoDB → broadcasted as `code-updated` to partner (debounced 500ms)
- Chat messages: `socket.emit('chat-message')` → persisted to MongoDB → broadcasted to all users

**4. Ending Session**
- User calls `PUT /collaboration/session/:sessionId/end`
- Server updates status to 'completed', saves attempt to User-Question Service
- Emits `session-ended` and `session-ended-confirmed` WebSocket events
- Both users receive notifications and navigate to home page

## Example Requests

### Create Session (from Matching Service)
```bash
curl -X POST http://localhost:5051/collaboration/session \
  -H "Content-Type: application/json" \
  -d '{
  "users": [
      { "userId": "user123", "username": "Alice" },
      { "userId": "user456", "username": "Bob" }
  ],
  "difficulty": "Medium",
    "topic": "Algorithms",
    "questionData": { "questionId": "q789" }
  }'
```

### Get Session Details
```bash
curl -X GET http://localhost:5051/collaboration/session/550e8400-... \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### End Session
```bash
curl -X PUT http://localhost:5051/collaboration/session/550e8400-.../end \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### WebSocket Connection (Frontend)
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5051');

// Join session
socket.emit('join-session', {
  sessionId: '550e8400-...',
    userId: 'user123',
    username: 'Alice'
});

// Send code changes
socket.emit('code-change', {
  sessionId: '550e8400-...',
  code: 'function twoSum(nums, target) { ... }',
    language: 'javascript'
});

// Listen for updates
socket.on('code-updated', (data) => {
  console.log('Code updated by:', data.updatedBy);
  setCode(data.code);
});

socket.on('session-state', (data) => {
  console.log('Connected users:', data.connectedUsers);
});
```

## Service Integration

**Incoming Requests:**
- **Matching Service (MS3)** → `POST /collaboration/session` - Creates sessions when users are matched
- **Frontend** → REST API for session CRUD operations
- **Frontend** → WebSocket for real-time collaboration events

**Outgoing Requests:**
- **Question Service (MS2)** → `GET /questions/internal/:id` - Fetches question details
- **User Service (MS1)** → `GET /users/:id` - Validates JWT tokens and fetches user data
- **User-Question Service (MS5)** → `POST /attempt` - Saves user attempts when sessions end

## Running the Service

### Development Mode
```bash
cd collaboration-service
npm install
npm run dev
```

### Production Mode
```bash
npm start
```

### Docker
```bash
docker-compose up collaboration-service
```

## Security Considerations
- JWT authentication for all protected REST endpoints
- Session validation: users can only access sessions they're participants in
- WebSocket authorization: socket events validate user membership
- CORS protection: configured to only allow requests from frontend
- Input validation on all user inputs
