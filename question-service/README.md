# Question Service

The **Question Service** is a Node.js + Express microservice that manages question-related logic and data for the application. 
- It provides RESTful APIs to create, fetch, and manage coding questions, and exposes internal service-to-service endpoints for integration with other microservices.
- This service uses MongoDB (via Mongoose) and is containerized using Docker.

## Features
- CRUD operations for questions
- Topic retrieval endpoint
- Distinction between external (authenticated) and internal (trusted service) routes
- MongoDB integration via Mongoose
- Environment-based configuration (`.env` or `.env.production`)
- Docker-ready for deployment

## Project Structure
```
question-service/
├── src/
│   ├── app.js                    # Express app setup
│   ├── index.js                  # Server entry point
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── controllers/
│   │   └── questionController.js # Request handlers
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── models/
│   │   └── questionModel.js      # Question schema definition
│   └── routes/
│       └── question.js           # API routes
├── .env.sample                   # Sample env file for local environment variables
├── .env.production               # Production environment variables
├── Dockerfile                    # Docker build configuration
├── package.json                  # Dependencies
├── nodemon.json                  # Dev reload configuration
└── README.md                     # This file
```

## Environment variables 
You can maintain two environment files:
- `.env` → used for local development, refer to `.env.sample` for the template 
- `.env.production` → used for Docker or production deployment

If you are already using `.env.production` and it includes valid production configs, `.env` is not strictly required unless you want separate local credentials (e.g., local MongoDB, localhost URLs).

Example `.env` file in the root of `question-service` folder:
```
PORT=5052
MONGODB_CONNECTION=mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>
JWT_SECRET=
USER_SERVICE_URL=http://localhost:5050
FRONTEND_URL=http://localhost:3000
```
** Do not wrap the connection string in quotes when using Docker’s `--env-file` **

## Local Development
1. Install dependencies
  ```
  npm install
  ```

2. Start the question service
  ```
  npm start
  ```

3. You should see
  ```
  Question Service running on port 5052
  MongoDB connected for Question Service
  ```

4. Test the health endpoint
  ```
  curl http://localhost:5052/health
  ```

## Docker Deployment 
1. Build the Docker image
  ```
  docker build -t question-service .
  ```

2. Run the container
  ```
  docker run -d \
  --name question-service \
  --env-file .env \
  -p 5052:5052 \
  question-service
  ```

3. Verify it's running 
  ```
  curl http://localhost:5052/health
  ```

4. View logs if needed
  ```
  docker logs -f question-service
  ```

## API Endpoints 
| Method | Endpoint  | Description                                             |
| ------ | --------- | ------------------------------------------------------- |
| `GET`  | `/questions`        | Fetch all questions (filter by `topic` or `difficulty`) |
| `GET`  | `/questions/topics` | Retrieve distinct list of topics                        |
| `GET`  | `/questions/internal/random-question?topic=&difficulty=` | Get a random question matching criteria                   |
| `GET`  | `/questions/internal/:questionId`                        | Get a question by its numeric `questionId` (not ObjectId) |
| `GET`  | `/questions/last-question-id`                            | Retrieve the highest questionId value in the collection   |
| `POST` | `/questions/add-question`                                | Add a new question document                               |

### Example Request 
#### Add a new question
```
curl -X POST http://localhost:5052/add-question \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": 101,
    "title": "Two Sum",
    "description": "Find indices of two numbers that add up to a target.",
    "difficulty": "Easy",
    "topic": ["Array", "HashMap"],
    "examples": [
      { "input": "[2,7,11,15], target=9", "output": "[0,1]" }
    ]
  }'
```