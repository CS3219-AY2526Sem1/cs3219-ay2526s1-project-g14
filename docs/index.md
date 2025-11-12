# PeerPrep API & Services Documentation

> CS3219 Group 14 — PeerPrep  
> Technical Interview Preparation Platform  
> Built with a Microservices Architecture using Node.js, Express, MongoDB, Redis, and React.

---

## Overview

PeerPrep enables users to practice technical interview questions collaboratively in real time.  
Each microservice runs independently in Docker, exposing RESTful APIs that communicate over internal Docker DNS and public HTTP endpoints.

**Core Microservices**
1. User Service (port 5050)  
2. Matching Service (port 5053)  
3. Question Service (port 5052)  
4. Collaboration Service (port 5051)  
5. User Question Service (port 5054)  
6. AI Service (port 5055)  
7. Frontend (React, port 3000)

---

## MS1 – User Service

Handles **user authentication**, **profile management**, and **email verification** using OTP.

### **Base URL:** `/auth`, `/user`

### Authentication Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/register` | Register a new user and send OTP |
| POST | `/verifyOtp` | Verify OTP for registration or email change |
| POST | `/resendOtp` | Resend OTP email |
| POST | `/login` | Login and issue JWT |
| POST | `/firebase` | Login or register via Google Firebase |

### User Routes (JWT Required)
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/user/:userId` | Retrieve user details |
| PUT | `/user/updateUsername` | Update username |
| PUT | `/user/updatePassword` | Update password |
| POST | `/user/changeEmail/request` | Request OTP for email change |
| POST | `/user/changeEmail/verify` | Verify new email |
| DELETE | `/user/delete` | Delete user account |

### Environment Variables
```bash
# Server
PORT=5050
NODE_ENV=production

# Database
MONGODB_CONNECTION=<MongoDB Atlas URI>

# Authentication
JWT_SECRET=<secret-key>

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=peerprep14@gmail.com
SMTP_PASS=<app-password>

# Optional secondary email password
EMAIL_PASS=<backup-email-password>

# Internal Networking (Docker DNS)
USER_SERVICE_URL=http://user-service:5050
QUESTION_SERVICE_URL=http://question-service:5052
MATCHING_SERVICE_URL=http://matching-service:5053
USER_QUESTION_SERVICE_URL=http://user-question-service:5054
COLLABORATION_SERVICE_URL=http://collaboration-service:5051

# Frontend URL
FRONTEND_URL=http://localhost:3000

````

---

## MS2 – Matching Service

Handles **FIFO-based matchmaking** between users by topic and difficulty using Redis.

### **Base URL:** `/matching`

| Method | Endpoint                      | Description              |
| ------ | ----------------------------- | ------------------------ |
| POST   | `/matching/start`             | Start new match request  |
| GET    | `/matching/:requestId/status` | Poll match status        |
| DELETE | `/matching/:requestId/cancel` | Cancel pending request   |
| GET    | `/health/live`                | Check Redis connection   |
| GET    | `/health/services`            | Check dependent services |

**Redis Keys**

* `queue:<topic>:<difficulty>` — waiting users queue
* `req:<requestId>` — request metadata
* `lock:user:<userId>` — prevent duplicate sessions

### Environment Variables
```bash
# Server
PORT=5053
NODE_ENV=production

# Redis
REDIS_URL=redis://redis:6379
MATCH_REQUEST_TTL_SECONDS=60
USER_LOCK_TTL_SECONDS=60

# Database
MONGODB_CONNECTION=<MongoDB Atlas URI>

# Authentication
JWT_SECRET=<secret>

# Internal Networking
USER_SERVICE_URL=http://user-service:5050
QUESTION_SERVICE_URL=http://question-service:5052
MATCHING_SERVICE_URL=http://matching-service:5053
USER_QUESTION_SERVICE_URL=http://user-question-service:5054
COLLABORATION_SERVICE_URL=http://collaboration-service:5051

# Frontend
FRONTEND_URL=http://localhost:3000

````
---

## MS3 – Question Service

Stores and manages **question data**, metadata, and admin operations.

### **Base URL:** `/questions`

| Method | Endpoint                              | Description                             |
| ------ | ------------------------------------- | --------------------------------------- |
| GET    | `/questions`                          | Retrieve all questions (with filters)   |
| GET    | `/questions/topics`                   | Get distinct topics                     |
| POST   | `/questions/add-question`             | Add new question *(admin only)*         |
| GET    | `/questions/internal/:id`             | Fetch specific question by ID           |
| GET    | `/questions/internal/random-question` | Get random question by topic/difficulty |
| GET    | `/questions/last-question-id`         | Retrieve last used question ID          |

**Schema Example**

```json
{
  "questionId": 105,
  "title": "Valid Palindrome",
  "description": "Check if a string is a palindrome.",
  "difficulty": "Easy",
  "topic": ["String"],
  "examples": [
    { "input": "\"A man, a plan, a canal: Panama\"", "output": "true" }
  ]
}
```

### Environment Variables
```bash
# Server
PORT=5052
NODE_ENV=production

# Database
MONGODB_CONNECTION=<MongoDB Atlas URI>

# Authentication
JWT_SECRET=<secret>

# Mail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=peerprep14@gmail.com
SMTP_PASS=<app-password>
EMAIL_PASS=<backup-email-password>

# Internal Networking
USER_SERVICE_URL=http://user-service:5050
QUESTION_SERVICE_URL=http://question-service:5052
MATCHING_SERVICE_URL=http://matching-service:5053
USER_QUESTION_SERVICE_URL=http://user-question-service:5054
COLLABORATION_SERVICE_URL=http://collaboration-service:5051

# Frontend
FRONTEND_URL=http://localhost:3000
````
---

## MS4 – Collaboration Service

Provides **real-time coding sessions** and chat via WebSockets.

### **Base URL:** `/collaboration`

### REST API

| Method | Endpoint       | Description                      |
| ------ | -------------- | -------------------------------- |
| POST   | `/session`     | Create new collaboration session |
| GET    | `/session/:id` | Retrieve session details         |
| PUT    | `/session/end` | End collaboration session        |
| GET    | `/health/live` | Health check                     |

### Socket.IO Events

| Event           | Description               |
| --------------- | ------------------------- |
| `join-session`  | Join session room         |
| `code-update`   | Sync code between users   |
| `chat-message`  | Send chat messages        |
| `session-ended` | End collaboration session |

### Environment Variables
```bash
# Server
PORT=5051
NODE_ENV=production

# Database
MONGODB_CONNECTION=<MongoDB Atlas URI>

# Authentication
JWT_SECRET=<secret>

# Internal Networking
USER_SERVICE_URL=http://user-service:5050
QUESTION_SERVICE_URL=http://question-service:5052
MATCHING_SERVICE_URL=http://matching-service:5053
USER_QUESTION_SERVICE_URL=http://user-question-service:5054
COLLABORATION_SERVICE_URL=http://collaboration-service:5051

# Frontend
FRONTEND_URL=http://localhost:3000
````
---

## MS5 – User Question Service

Tracks **user attempts**, computes stats, and powers the leaderboard.

### **Base URL:** `/attempts`, `/stats`, `/leaderboard`

| Method | Endpoint            | Description                       |
| ------ | ------------------- | --------------------------------- |
| POST   | `/attempts`         | Save a user attempt               |
| GET    | `/attempts`         | Retrieve all user attempts        |
| GET    | `/stats`            | Get performance statistics        |
| GET    | `/leaderboard`      | Global leaderboard                |
| GET    | `/leaderboard/home` | Leaderboard preview for dashboard |

**Leaderboard Metrics**

* Success Rate
* Average Completion Time
* Streak Count
* Recency Weight

### Environment Variables
```bash
# Server
PORT=5054
NODE_ENV=production

# Database
MONGODB_CONNECTION=<MongoDB Atlas URI>

# Authentication
JWT_SECRET=<secret>

# Mail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=peerprep14@gmail.com
SMTP_PASS=<app-password>
EMAIL_PASS=<backup-email-password>

# Internal Networking
USER_SERVICE_URL=http://user-service:5050
QUESTION_SERVICE_URL=http://question-service:5052
MATCHING_SERVICE_URL=http://matching-service:5053
USER_QUESTION_SERVICE_URL=http://user-question-service:5054
COLLABORATION_SERVICE_URL=http://collaboration-service:5051

# Frontend
FRONTEND_URL=http://localhost:3000

````
---

## MS6 – AI Service

Integrates **AI-assisted code explanations** using Gemini API.

### **Base URL:** `/ai`

| Method | Endpoint  | Description               |
| ------ | --------- | ------------------------- |
| POST   | `/assist` | Generate code explanation |
| GET    | `/ping`   | Health check              |

**Example Request**

```json
{
  "code": "def two_sum(nums, target): ...",
  "language": "python",
  "question": "Find two numbers that add up to target"
}
```

**Example Response**

```json
{
  "explanation": "This function iterates through pairs of numbers to find two that sum to the target.",
  "type": "AI-Generated Explanation"
}
```

### Environment Variables
```bash
# AI Configuration
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_MODEL=gemini-2.5-flash-lite

# Server
PORT=5055
NODE_ENV=production

# Internal Networking
USER_SERVICE_URL=http://user-service:5050
COLLABORATION_SERVICE_URL=http://collaboration-service:5051
FRONTEND_URL=http://localhost:3000

````
---

## MS7 – Frontend Service

Built with **React + Redux + MUI**, providing a unified interface for all services.

### **Key Features**

* Responsive layout with modern UI
* Real-time chat + code collaboration
* Firebase Google Auth + JWT login
* Admin question management tools
* Leaderboard + attempt tracking
* Snackbar info system for login issues

### Environment Variables
```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=<firebase-api-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<firebase-auth-domain>
REACT_APP_FIREBASE_PROJECT_ID=<firebase-project-id>
REACT_APP_FIREBASE_STORAGE_BUCKET=<firebase-storage-bucket>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
REACT_APP_FIREBASE_APP_ID=<firebase-app-id>
REACT_APP_FIREBASE_MEASUREMENT_ID=<measurement-id>

# Backend Services - Docker Localhost URLs
REACT_APP_COLLABORATION_URL=http://localhost:5051
REACT_APP_MATCHING_URL=http://localhost:5053
REACT_APP_QUESTION_URL=http://localhost:5052
REACT_APP_USER_URL=http://localhost:5050
REACT_APP_USERQUESTION_URL=http://localhost:5054

````

---

## System Architecture Overview

```
Frontend (React)
│
├── User Service ──► MongoDB (users)
├── Question Service ──► MongoDB (questions)
├── Matching Service ──► Redis Queue
├── Collaboration Service ──► WebSockets
└── User Question Service ──► MongoDB (attempts)
```

* Each service communicates via Docker internal DNS (`user-service:5050`, etc.)
* MongoDB Atlas used for persistence
* Redis used for queue-based matching
* JWT for secure inter-service authentication
* NGINX proxy for frontend deployment

---

## NUS Wi-Fi Compatibility Note

Some users experience OTP verification failures when connected to NUS Wi-Fi.
This is caused by **blocked SMTP ports (25, 465, 587)** used for outgoing mail.

**Suggested Workarounds**

* Use a mobile hotspot or external network for registration
* Switch to **HTTPS-based email APIs** (e.g., SendGrid, Mailgun) for reliable email delivery
* Frontend snackbar hint appears automatically after repeated failures:

  > “Having trouble logging in or signing up? Try hotspot — NUS Wi-Fi blocks required ports.”

---

## Tech Stack Summary

| Layer                | Technologies                                |
| -------------------- | ------------------------------------------- |
| **Frontend**         | React.js, Redux Toolkit, MUI, Framer Motion |
| **Backend**          | Node.js, Express, Axios                     |
| **Database**         | MongoDB Atlas                               |
| **Cache / Queue**    | Redis                                       |
| **Containerisation** | Docker Compose                              |
| **Authentication**   | JWT + Firebase                              |
| **CI/CD**            | GitHub Actions (future CD enhancement)      |

---

## Future Enhancements

* Enhanced admin dashboard for content management
* Multi-user collaboration sessions
* Integrated voice and video (WebRTC)
* Continuous Deployment with AWS/GCP
* **NUS Wi-Fi network compatibility improvements** (migrate SMTP → HTTPS email APIs)
* AI-powered question recommendations
* User badges and achievements system
* Dark/light theme support

---
