[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/QUdQy4ix)
# CS3219 Project (PeerPrep) - AY2526S1
## Group: G14

PeerPrep is a distributed full-stack web application that enables collaborative coding practice between users. It uses a microservices architecture (User, Matching, Question, Collaboration, and User-Question services) with Docker for containerisation.

### Running the app
Prerequisites: 
- [Docker](https://docs.docker.com/get-started/get-docker/) installed 
- [Docker Compose](https://docs.docker.com/compose/)

Steps: 
1. Add environment files.
    - Each service requires its own `.env.production` file for configuration.
    - These files are not committed for security reasons.

2. Build and run all services.
    ```
    docker compose up --build
    ```

3. Access the frontend on `http://localhost:3000`.

4. Verify the services are running:
    ```
    http://localhost:<PORT>/health/services
    ```
    - Example: `http://localhost:5053/health/services` should show:
        ```
        {"matching":"live","question":"live","user":"live","userquestion":"live","collaboration":"live"}
        ```

### Services Overview
| Service               | Port | Description                              |
| --------------------- | ---- | ---------------------------------------- |
| Frontend              | 3000 | React web client                         |
| User Service          | 5050 | Authentication and user management       |
| Question Service      | 5052 | Coding question management               |
| Collaboration Service | 5051 | Real-time code collaboration (WebSocket) |
| Matching Service      | 5053 | User matchmaking logic                   |
| User-Question Service | 5054 | User-question tracking and progress      |
| AI Service            | 5055 | AI Chatbot                               |
| Redis                 | 6379 | Caching and message broker               |


