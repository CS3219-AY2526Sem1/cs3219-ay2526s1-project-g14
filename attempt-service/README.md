# Attempt Service
Allows the user to view their past attempts and statistics

## Features
- **Persistent Storage**: MongoDB-backed data with attempt history
- **Service Integration**: Seamless integration with collaboration, user, and question services

| Concern                                          | Responsible Service     |
| ------------------------------------------------ | ----------------------- |
| Sockets, real-time events, active sessions       | Collaboration Service   |
| Session lifecycle → marks ended                  | Collaboration Service   |
| Persistence of completed sessions | **Collaboration Service**     |
| **Persistence of completed attempts** | **Attempt Service**     |
| **Retrieving past attempts, stats, history**     | **Attempt Service**     |


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
QUESTION_SERVICE_URL=http://localhost:5052
FRONTEND_URL=http://localhost:3000
```

### Environment Variables Explained

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port the service runs on | `5051` |
| `MONGODB_CONNECTION` | MongoDB connection string | Required |
| `JWT_SECRET` | Secret for JWT token verification | Required |
| `USER_SERVICE_URL` | URL of the user service | `http://localhost:5050` |
| `QUESTION_SERVICE_URL` | URL of the question service | `http://localhost:5052` |
| `COLLABORATION_SERVICE_URL` | URL of the collaboration service | `http://localhost:5051` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## Running the Service

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

```
[ Collaboration Service ]
    ↓ (on session end)
 POST /attempts
    ↓
[ Attempt Service ]
  → stores user attempt records
  → provides GET /attempts and /stats
```

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
attempt-service/
├── src/
│   ├── app.js                    # Express app setup
│   ├── index.js                  # Server entry point
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── controllers/
│   │   └── userAttemptController.js  # REST API handlers
│   ├── middleware/
│   │   └── auth.js               # JWT authentication
│   ├── models/
│   │   └── userAttemptModel.js       # Session schema
│   ├── routes/
│   │   └── userAttemptRoutes.js      # API routes
|
├── .env                          # Environment variables
├── .gitignore                    # Git ignore file
├── Dockerfile                    # Docker configuration
├── package.json                  # Dependencies
├── nodemon.json                  # Nodemon configuration
└── README.md                     # This file
```

## Error Handling

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

## Deployment

### Using Docker
1. Build the Docker image
  ```
  docker build -t question-service .
  ```

2. Run the container
  ```
  docker run -d \
  --name attempt-service \
  --env-file .env \
  -p 5053:5053 \
  attempt-service
  ```
  or
  ```
  docker run -p 5053:5053 \
  -e MONGODB_CONNECTION="your_connection_string" \
  -e JWT_SECRET="your_secret" \
  -e USER_SERVICE_URL="http://user-service:5050" \
  -e QUESTION_SERVICE_URL="http://question-service:5052" \
  -e COLLABORATION_SERVICE_URL="http://question-service:5051" \
  attempt-service
  ```

3. Verify it's running 
  ```
  curl http://localhost:5053/health
  ```

4. View logs if needed
  ```
  docker logs -f attempt-service
  ```

## Testing

### Manual Testing
1. Start the service: `npm run dev`
2. Use a tool like Postman to test REST endpoints


