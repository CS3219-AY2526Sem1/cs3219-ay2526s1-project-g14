# Question Service

The **Question Service** is a Node.js + Express microservice that manages question-related logic and data for the application. It provides RESTful APIs for creating, retrieving, updating, and deleting questions. This service is containerised using Docker and connects to MongoDB via Mongoose.

## Features
- REST API endpoints for question management
- MongoDB integration with Mongoose
- Environment-based configuration (`.env`)
- Ready for deployment via Docker

## Project Structure
```
question-service/
├── src/
│   ├── app.js                    # Express app setup
│   ├── index.js                  # Server entry point
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── controllers/
│   │   └── questionController.js  # REST API handlers
│   ├── middleware/
│   │   └── auth.js               # JWT authentication
│   ├── models/
│   │   └── questionModel.js       # Session schema
│   ├── routes/
│   │   └── question.js      # API routes
│   └── services/   
├── .env                          # Environment variables
├── .gitignore                    # Git ignore file
├── Dockerfile                    # Docker configuration
├── package.json                  # Dependencies
├── nodemon.json                  # Nodemon configuration
└── README.md                     # This file
```

## Environment variables 
Create a `.env` file in the root of `question-service` folder:
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