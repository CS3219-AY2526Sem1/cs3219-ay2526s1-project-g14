# 🤝 Collaboration System - Integration Guide

## 📋 Overview
This is a **real-time collaboration system** that enables 2 users to work together on coding problems. It integrates with matching services, user services, and question services to provide a complete collaborative coding experience.


## 🔄 Current Implementation Status

### ✅ **What's Working (Production Ready)**
- **WebSocket Real-time Communication**: Code sync, chat, cursor tracking
- **Session Management**: Create, join, update, end sessions
- **Collaboration Features**: Live code editing, chat system
- **API Endpoints**: All REST endpoints functional

### 🧪 **What's Mocked (Needs Integration)**
- **User Data**: Using mock users (Alice, Bob, Charlie)
- **Question Data**: Using mock questions with sample problems
- **Matching Service**: Mock implementation for testing
- **Authentication**: Bypassed for development

---

## 🔌 Integration Points

### 1. **Matching Service Integration**

**Current Mock**: `backend/controller/mockMatchingController.js`
**Replace With**: actual matching service

```javascript
// CURRENT MOCK IMPLEMENTATION
exports.joinMatchingQueue = async (req, res) => {
    // Mock logic - finds matches in memory queue
    const match = mockMatchingQueue.findIndex(entry => 
        entry.difficulty === difficulty && entry.topic === topic
    );
    // ... creates session via collaboration API
};

// PRODUCTION INTEGRATION NEEDED
// Your matching service should call:
POST /collaboration/session
{
  "users": [
    { "userId": "real_user_123", "username": "RealAlice" },
    { "userId": "real_user_456", "username": "RealBob" }
  ],
  "difficulty": "Medium",
  "topic": "Arrays",
  "questionData": { /* real question from your question service */ }
}
```

### 2. **User Service Integration**

**Current Mock**: `backend/mockData.js` - mockUsers
**Replace With**: Your user database/service

```javascript
// CURRENT MOCK DATA
const mockUsers = new Map();
mockUsers.set('user123', {
    _id: 'user123',
    userId: 'user123',
    username: 'Alice',
    email: 'alice@test.com'
});

// PRODUCTION INTEGRATION NEEDED
// Replace mockUsers with calls to your user service:
const User = require('./model/user'); // Your actual user model
const user = await User.findById(userId);
```

### 4. **Session Model Integration**

**Current Mock**: `backend/mockData.js` - mockSessions  
**Existing Model**: `backend/model/sessionModel.js`

// PRODUCTION INTEGRATION NEEDED
// Replace with your question service:
const Question = require('./model/questionModel'); // Your actual question model
const question = await Question.findById(questionId);


### 5. **Authentication Integration**

**Current State**: Authentication bypassed in `frontend/src/App.js`
**Replace With**: Your authentication system

```javascript
// CURRENT BYPASS (frontend/src/App.js)
useEffect(() => {
    const mockUser = {
        user: {
            token: 'mock-jwt-token-for-testing',
            _id: 'user123',
            email: 'alice@test.com',
            username: 'Alice'
        }
    };
    localStorage.setItem('state', JSON.stringify(mockUser));
}, []);

// PRODUCTION INTEGRATION NEEDED
// Remove bypass and integrate with your auth system
// Ensure JWT tokens are properly validated in backend middleware
// Remove my userSelector, disconnect from mockData
```

---

## Temporary Removals for Testing/Development

### **Authentication & JWT Temporarily Disabled**

**Files Modified for Testing:**
```javascript
// backend/routes.js - AUTH MIDDLEWARE DISABLED
// Question routes (🧪 AUTH DISABLED for testing)
router.get("/questions", getQuestions);           // Remove authMiddleware
router.get("/questions/random", getRandomQuestion); // Remove authMiddleware  
router.get("/topics", getTopics);                 // Remove authMiddleware

// PRODUCTION: Re-enable authentication
router.get("/questions", authMiddleware, getQuestions);
router.get("/questions/random", authMiddleware, getRandomQuestion);
router.get("/topics", authMiddleware, getTopics);
```

```javascript
// backend/config/jwt.js - FALLBACK JWT SECRET
module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'test-jwt-secret-for-development-only-not-secure',
  jwtExpire: "12h",
};

// PRODUCTION: Remove fallback, require real JWT_SECRET
module.exports = {
  jwtSecret: process.env.JWT_SECRET, // Must be set in production
  jwtExpire: "12h",
};
```

```javascript
// backend/config/otp.js - MOCK EMAIL TRANSPORTER
const transporter = {
    sendMail: async (options) => {
        console.log('🧪 TEST MODE: Mock email sent:', options.subject);
        return Promise.resolve({ messageId: 'test-message-id' });
    }
};

// PRODUCTION: Use real email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
```

### **UI Components to Remove in Production**

**1. Remove UserSelector Component**
```javascript
// frontend/src/views/home.js - REMOVE USER SELECTOR
import UserSelector from "../components/UserSelector"; // REMOVE THIS

export default function Home() {
    const [currentUser, setCurrentUser] = useState(null); // REMOVE THIS
    
    return (
        <Box p={3} display="flex" flexDirection="column" gap={4}>
            <UserSelector onUserSelected={setCurrentUser} /> {/* REMOVE THIS */}
            
            {currentUser && ( // REMOVE THIS CONDITION
                <>
                    <Welcome username={currentUser.username} />
                    <Box display="flex" gap={3} flexWrap="wrap">
                        <MatchingBox /* ... */ />
                    </Box>
                </>
            )}
        </Box>
    )
}

// PRODUCTION: Get user from real auth system
export default function Home() {
    const { user } = useSelector((state) => state.auth); // Real auth state
    
    return (
        <Box p={3} display="flex" flexDirection="column" gap={4}>
            <Welcome username={user.username} />
            <Box display="flex" gap={3} flexWrap="wrap">
                <MatchingBox currentUser={user} /* ... */ />
            </Box>
        </Box>
    )
}
```

**2. Remove Auth Bypass in App.js**
```javascript
// frontend/src/App.js - REMOVE AUTH BYPASS
function AppContent() {
  const navigate = useNavigate();
  const { username } = useSelector((state) => state.auth);
  
  // 🧪 DISABLE AUTH - Skip authentication completely - REMOVE THIS
  useEffect(() => {
    const mockUser = {
      user: {
        token: 'mock-jwt-token-for-testing',
        _id: 'user123',
        email: 'alice@test.com',
        username: 'Alice'
      }
    };
    localStorage.setItem('state', JSON.stringify(mockUser));
    console.log('🧪 AUTH DISABLED: Default user set');
  }, []);

  // PRODUCTION: Re-enable authentication check
  const checkAuthenticated = () => {
    if (username == null) {
      navigate(PAGES.LOGIN)
    }
  }

  useEffect(() => {
    checkAuthenticated()
  })
```

**3. Remove Test Login Components**
```bash
# DELETE THESE FILES IN PRODUCTION:
frontend/src/components/UserSelector.jsx          # REMOVE - Test user selector
frontend/src/components/auth/TestLogin.js         # REMOVE - Test login (if exists)

# KEEP THESE FILES:
frontend/src/components/auth/Login.js              # KEEP - Real login
frontend/src/components/auth/Register.js           # KEEP - Real register  
frontend/src/components/auth/GoogleAuth.js         # KEEP - Real Google auth
```

**4. Remove Mock Data Dependencies**
```javascript
// backend/mockData.js - REMOVE ENTIRE FILE IN PRODUCTION
// This file contains:
// - mockUsers (Alice, Bob, Charlie)
// - mockQuestions (sample coding problems)  
// - mockSessions (in-memory session storage)
// - Mock model implementations

// PRODUCTION: Replace with real database models
const User = require('./model/user');           // Real user model
const Question = require('./model/questionModel'); // Real question model  
const Session = require('./model/sessionModel');   // Real session model
```

**5. Remove Development Debugging**
```javascript
// Remove console.log statements added for debugging:
// frontend/src/components/home/MatchingBox.jsx
console.log('🚀 Starting match with user:', currentUser);        // REMOVE
console.log('🎯 MatchingBox received match-found event');         // REMOVE
console.log('✅ Match confirmed for user:', currentUser.username); // REMOVE

// backend/controller/mockMatchingController.js  
console.log('📤 Broadcasting match-found event:', matchData);     // REMOVE
console.log('✅ WebSocket notification sent to all clients');     // REMOVE
console.log('📡 Notifying socket:', socketId);                   // REMOVE

// frontend/src/services/collaborationService.js
console.log('🔌 Connected to collaboration service, socket ID:'); // REMOVE
console.log('🔔 WebSocket match-found event received by socket:'); // REMOVE
```

### **Files to Completely Remove in Production**
```bash
# Backend files to DELETE:
backend/controller/mockMatchingController.js    # Mock matching service
backend/mockData.js                            # All mock data
backend/test-env-setup.js                      # Test environment (if exists)

# Frontend files to DELETE:  
frontend/src/components/UserSelector.jsx       # Test user selector
frontend/src/components/auth/TestLogin.js      # Test login (if exists)

# Documentation files (optional to keep):
test-collaboration.md                          # Testing guide
test-setup.sh                                # Test setup script
WORKFLOW.md                                   # Development workflow
```

---

## 📡 API Endpoints (Production Ready)

### **Collaboration Microservice API**

#### 1. Create Session (Called by Matching Service)
```http
POST /collaboration/session
Content-Type: application/json

{
  "users": [
    { "userId": "user123", "username": "Alice" },
    { "userId": "user456", "username": "Bob" }
  ],
  "difficulty": "Medium",
  "topic": "Arrays",
  "questionData": {
    "questionId": "q_12345",
    "title": "Two Sum Problem",
    "description": "Given an array...",
    "difficulty": "Medium",
    "topic": ["Arrays", "Hash Table"],
    "examples": [...],
    "image": "optional-image-url"
  }
}
```

#### 2. Get Session Details
```http
GET /collaboration/session/{sessionId}
Authorization: Bearer {jwt-token}
```

#### 3. Update Session Code
```http
PUT /collaboration/session/{sessionId}/code
Content-Type: application/json
Authorization: Bearer {jwt-token}

{
  "code": "function twoSum(nums, target) { ... }",
  "language": "javascript"
}
```

#### 4. End Session
```http
PUT /collaboration/session/{sessionId}/end
Authorization: Bearer {jwt-token}
```

#### 5. Get User's Active Session
```http
GET /collaboration/user/{userId}/session
Authorization: Bearer {jwt-token}
```

### **Mock Matching API (Remove in Production)**

```http
# These endpoints are for testing only - remove when integrating real matching service
POST /matching/queue          # Join matching queue
DELETE /matching/queue/{userId} # Leave matching queue
GET /matching/queue/status     # Get queue status
POST /matching/users          # Create mock user
```

---

## WebSocket Events (Production Ready)

### **Client → Server Events**
```javascript
// join collaboration session
socket.emit('join-session', {
    sessionId: 'session_123',
    userId: 'user123',
    username: 'Alice'
});

// send code changes
socket.emit('code-change', {
    sessionId: 'session_123',
    code: 'function solution() { ... }',
    language: 'javascript'
});

// send chat message
socket.emit('chat-message', {
    sessionId: 'session_123',
    message: 'What do you think about this approach?',
    userId: 'user123',
    username: 'Alice'
});

// send cursor position (currently not working)
socket.emit('cursor-change', {
    sessionId: 'session_123',
    line: 5,
    column: 10,
    userId: 'user123'
});

// end session
socket.emit('end-session', {
    sessionId: 'session_123'
});
```

### **Server → Client Events**
```javascript
// user joined session
socket.on('user-joined', (data) => {
    // { userId: 'user456', username: 'Bob', sessionId: 'session_123' }
});

// code  updated
socket.on('code-updated', (data) => {
    // { code: '...', language: 'javascript', userId: 'user456' }
});

// New chat message
socket.on('new-message', (data) => {
    // { message: '...', userId: 'user456', username: 'Bob', timestamp: '...' }
});

// Cursor position changed
socket.on('cursor-updated', (data) => {
    // { line: 5, column: 10, userId: 'user456' }
});

// Partner left session
socket.on('user-left', (data) => {
    // { userId: 'user456', username: 'Bob' }
});

// Session ended
socket.on('session-ended', (data) => {
    // { sessionId: 'session_123', endedBy: 'user456' }
});

// Match found (for matching service)
socket.on('match-found', (data) => {
    // { sessionId: 'session_123', users: [...] }
});
```

---

##  Data Models

### **Session Model**
```javascript
{
  _id: "ObjectId",
  sessionId: "session_1234567890",
  participants: [
    { userId: "user123", username: "Alice" },
    { userId: "user456", username: "Bob" }
  ],
  questionId: "q_12345",
  difficulty: "Medium",
  topic: "Arrays",
  status: "active", // "active", "ended", "abandoned"
  code: "function solution() { ... }",
  language: "javascript",
  startTime: "2024-01-01T10:00:00Z",
  endTime: null,
  chatHistory: [
    {
      userId: "user123",
      username: "Alice",
      message: "Let's start with a brute force approach",
      timestamp: "2024-01-01T10:01:00Z"
    }
  ],
  questionMetadata: {
    title: "Two Sum Problem",
    description: "Given an array...",
    examples: [...],
    image: "optional-url"
  },
  createdAt: "2024-01-01T10:00:00Z",
  updatedAt: "2024-01-01T10:05:00Z"
}
```

---

## stuff to integrat (checklist)

### **For Matching Service**
- [ ] Replace `mockMatchingController.js` with your matching logic
- [ ] Call `POST /collaboration/session` when users are matched
- [ ] Handle WebSocket notifications for match results
- [ ] Integrate with your user service for user data

### **For User Service**
- [ ] Replace `mockUsers` in `mockData.js` with your user model
- [ ] Ensure user IDs are consistent across services
- [ ] Provide user authentication tokens
- [ ] Handle user profile data (username, email, etc.)

### **frontend**
- [ ] Remove authentication bypass in `App.js`
- [ ] Integrate with your authentication system
- [ ] Replace `UserSelector` component with real user data
- [ ] Update API endpoints if backend URL changes
- [ ] Handle real user sessions and tokens

### **other stuff**
- [ ] Set up environment variables:
  - `JWT_SECRET` and `JWT_EXPIRE`
  - `FRONTEND_URL` for CORS
- [ ] Configure WebSocket connections
- [ ] Set up service-to-service communication
- [ ] Handle scaling for multiple collaboration sessions

---


### **3. Test Collaboration**
1. Open two browser windows
2. Select different users (Alice, Bob)
3. Choose same topic/difficulty
4. Click "Find Partner"
5. Both users should enter collaboration session

---

## Debugging

### **WebSocket Connection**
```javascript
//  WebSocket connection in browser console
console.log('Socket connected:', collaborationService.isConnected);
console.log('Socket ID:', collaborationService.socket.id);
```

### **Backend Logs**
```bash
 Connected clients: 2
 Broadcasting match-found event: {...}
 WebSocket notification sent to all connected clients
```

### **Frontend Logs**
```bash
 Connected to collaboration service, socket ID: abc123
 WebSocket match-found event received by socket: abc123
 Match confirmed for user: Alice
```
