# User Question Service
- Manages user attempts and leaderboard rankings
- Itegrates tightly with the Collaboration, Question, and User services to persist attempts, compute scores, and deliver leaderboards

## Features
- Persistent Storage
  - MongoDB for saving all user attempts
- User Statistics
  - Aggregate stats: success rate, average pass rate, time to pass
- Leaderboard System 
  - Global rankings (overall, speed, streak)
- Service Integration — Connects with:
  - Collaboration Service (for session + participant info)
  - Question Service (for question details)
  - User Service (for usernames in leaderboard)

| Concern                             | Responsible Service   |
| ----------------------------------- | --------------------- |
| Real-time sessions                  | Collaboration Service |
| Session lifecycle (start → end)     | Collaboration Service |
| Question info                       | Question Service      |
| **Persistence of attempts & stats** | **User Question Service**   |
| **Leaderboard computation**         | **User Question Service**   |

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- `.env` or `.env.production` file configured

## Architecture Overview
```
  On session end
        ↓ 
   POST /attempt
        ↓
[ Attempt Service ]
    → Saves attempt for all participants
    → Provides GET /attempt and /attempt/stats
    → Computes leaderboards via /leaderboard endpoints
```

| Category               | Purpose                       |
| ---------------------- | ----------------------------- |
| **Service Type**       | REST microservice             |
| **Primary Functions**  | Attempts, Stats, Leaderboards |
| **Data Store**         | MongoDB                       |
| **Auth**               | JWT                           |
| **Connected Services** | User, Question, Collaboration |
| **Port**               | `5054`                        |


## API Endpoints
### Attempt routes (`/attempt`)
| Method | Endpoint | Description                                           | 
| ------ | -------- | ----------------------------------------------------- | 
| `POST` | `/`      | Record an attempt for a collaboration session participants        | 
| `GET`  | `/`      | Retrieve user's past attempts (with question details) | 
| `GET`  | `/stats` | Retrieve user's statistics                            | 

### Leaderboard routes (`/leaderboard`)
| Method | Endpoint   | Description                                 | 
| ------ | ---------- | ------------------------------------------- | 
| `GET`  | `/`        | General leaderboard (overall)               | 
| `GET`  | `/overall` | Ranked by overall score                     | 
| `GET`  | `/speed`   | Ranked by fastest average solve time        | 
| `GET`  | `/streak`  | Ranked by active streak days                | 
| `GET`  | `/home`    | Quick leaderboard snapshot for current user | 

Scoring Factors:
- Total questions passed
- Average passing rate
- Speed (time taken per attempt)
- Recency weight (recent attempts are worth more)

### Health Check
```http
GET /health
```

Returns:
```json
{
  "status": "OK",
  "service": "attempt-service"
}
```

## Project Structure

```
user-question-service/
├── src/
│   ├── app.js                      # Express app setup
│   ├── index.js                    # Entry point
│   ├── config/
│   │   └── database.js             # MongoDB connection
│   ├── controllers/
│   │   ├── userAttemptController.js  # Attempt endpoints
│   │   └── leaderboardController.js  # Leaderboard endpoints
│   ├── middleware/
│   │   └── auth.js                 # JWT auth middleware
│   ├── models/
│   │   └── userAttemptModel.js     # Attempt schema
│   ├── routes/
|   |   ├── health.js   
│   │   ├── userAttemptRoutes.js    # /attempt routes
│   │   └── leaderboardRoutes.js    # /leaderboard routes
│   └── utils/                      # Optional helpers
├── .env 
├── .env.production
├── Dockerfile
├── nodemon.json
├── package.json
└── README.md
```

## Error Handling
All responses follow a consistent JSON format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

| Code  | Meaning         | Example                       |
| ----- | --------------- | ----------------------------- |
| `400` | Invalid request | Missing required fields       |
| `401` | Unauthorized    | No or invalid JWT             |
| `403` | Forbidden       | User not in session           |
| `404` | Not found       | Question or session not found |
| `500` | Server error    | Internal logic or DB issue    |

## Testing
You can test endpoints using Postman, cURL, or any REST client.
Ensure valid Authorization headers when testing user-protected routes.




