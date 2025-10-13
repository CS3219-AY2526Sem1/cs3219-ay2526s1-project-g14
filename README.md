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

