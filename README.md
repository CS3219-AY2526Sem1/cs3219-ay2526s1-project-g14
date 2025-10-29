[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/QUdQy4ix)
# CS3219 Project (PeerPrep) - AY2526S1
## Group: G14

### Note: 
- You are required to develop individual microservices within separate folders within this repository.
- The teaching team should be given access to the repositories as we may require viewing the history of the repository in case of any disputes or disagreements.

### Running the app
#### Frontend 
1. Switch to `frontend` directory.
    ```
    cd frontend
    ```
2. Install dependencies.
    ```
    npm install
    ```
3. Start the app locally.
    ```
    npm start
    ```

#### Database
1. Switch to `backend` directory.
    ```
    cd backend
    ```
2. Install dependencies.
    ```
    npm install
    ```
3. Start the server.
    ```
    node server.js
    ```
4. You should see the message below if the connection is successful.
    ```
    Server is running on port 5000
    MongoDB connected
    ```

#### Matching Service
1. Switch to `matching-service` directory.
    ```
    cd matching-service
    ```
2. Install dependencies.
    ```
    npm install
    ```
3. Start the service.
    ```
    npm run dev
    ```
4. You should see the message below if the connection is successful.
    ```
    [redis] connected: redis://localhost:6379
    [matching-service] listening on http://localhost:4100
    ```

#### Collaboration Service and Question Service 
1. Add a `docker-compose.yml` file in the root folder: 
    ```
    version: "3.8"
    services:
        question-service:
            build: ./question-service
            ports:
            - "5052:5052"
            environment:
            - MONGODB_CONNECTION=your_connection_string
            - JWT_SECRET=your_secret

        collaboration-service:
            build: ./collaboration-service
            ports:
            - "5051:5051"
            environment:
            - MONGODB_CONNECTION=your_connection_string
            - JWT_SECRET=your_secret
            - USER_SERVICE_URL=http://user-service:5050
            - QUESTION_SERVICE_URL=http://question-service:5052
            - ATTEMPT_SERVICE_URL=http://attempt-service:5053
            depends_on:
            - question-service
        
        attempt-service:
            build: ./attempt-service
            ports:
            - "5053:5053"
            environment:
            - MONGODB_CONNECTION=your_connection_string
            - JWT_SECRET=your_secret
            - USER_SERVICE_URL=http://user-service:5050
            - QUESTION_SERVICE_URL=http://question-service:5052
            - COLLABORATION_SERVICE_URL=http://collaboration-service:5051
            depends_on:
            - collaboration-service
    ```

2. Run all services on the same internal network.
    ```
    docker compose up --build
    ```
