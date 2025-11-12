
# User Service

The **User Service** is a Node.js + Express microservice that manages user authentication, registration, OTP verification, and profile operations for PeerPrep.
It provides RESTful endpoints for user management and authentication, and also exposes internal service routes for integration with other microservices.
This service uses **MongoDB (via Mongoose)** and supports **email-based OTP verification** through Gmail SMTP.

---

## Features

* User registration with OTP verification
* Secure JWT-based authentication
* Password and email update functionality
* Firebase-based login integration
* Health checks for internal microservice dependencies
* Docker-ready configuration

---

## Project Structure

```
user-service/
├── src/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   ├── jwt.js              # JWT helper functions
│   │   └── otp.js              # OTP generation and email sending
│   ├── controller/
│   │   ├── authController.js   # Handles registration, login, and OTP
│   │   ├── userController.js   # User profile management
│   │   ├── matchingController.js # Handles user matching logic
│   │   └── healthController.js # Service health endpoints
│   ├── middleware/
│   │   └── auth.js             # JWT verification middleware
│   ├── model/
│   │   ├── userModel.js        # User schema
│   │   ├── tempUserModel.js    # Temporary users awaiting OTP verification
│   │   └── tempEmailModel.js   # Pending email change verification
│   ├── app.js                  # Express app configuration
│   ├── index.js                # Server entry point
│   └── routes.js               # API route definitions
├── .env.example                # Example environment variables
├── .env.production             # Production configuration
├── Dockerfile                  # Docker build setup
├── docker-compose.yml          # Local orchestration for all services
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

---

## Environment Variables

You can maintain two environment files:

* `.env` → used for local development (refer to `.env.example`)
* `.env.production` → used for Docker or production deployment

```bash
# Server
PORT=5050
NODE_ENV=production

# Database
MONGODB_CONNECTION=<MongoDB Atlas URI>

# Authentication
JWT_SECRET=<secret>

# Mail (SMTP Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=peerprep14@gmail.com
SMTP_PASS=<app-password>
EMAIL_PASS=<backup-email-password>

# Internal Service Networking (Docker DNS)
USER_SERVICE_URL=http://user-service:5050
QUESTION_SERVICE_URL=http://question-service:5052
MATCHING_SERVICE_URL=http://matching-service:5053
USER_QUESTION_SERVICE_URL=http://user-question-service:5054
COLLABORATION_SERVICE_URL=http://collaboration-service:5051

# Frontend
FRONTEND_URL=http://localhost:3000
```

---

## API Endpoints

| Method   | Endpoint                    | Description                         |
| -------- | --------------------------- | ----------------------------------- |
| `POST`   | `/auth/register`            | Register new user and send OTP      |
| `POST`   | `/auth/verifyOtp`           | Verify OTP to complete registration |
| `POST`   | `/auth/resendOtp`           | Resend OTP to email                 |
| `POST`   | `/auth/login`               | Authenticate existing user          |
| `POST`   | `/auth/firebase`            | Login or register via Firebase      |
| `GET`    | `/user/:userId`             | Retrieve user profile               |
| `PUT`    | `/user/updateUsername`      | Update username                     |
| `PUT`    | `/user/updatePassword`      | Update password                     |
| `POST`   | `/user/changeEmail/request` | Request email change                |
| `POST`   | `/user/changeEmail/verify`  | Verify new email                    |
| `DELETE` | `/user/delete`              | Delete account                      |
| `GET`    | `/health/live`              | Service health check                |
| `GET`    | `/health/services`          | Dependency health check             |

---

### Example Request

#### Register a New User

```bash
curl -X POST http://localhost:5050/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice123",
    "email": "alice@example.com",
    "password": "Password@123"
  }'
```

### Example Response

```json
{
  "message": "OTP sent to your email. Please verify to complete registration."
}
```

---

## Notes on Network Compatibility

If login or registration fails on **NUS Wi-Fi**, this is likely due to SMTP port blocking (ports 25, 465, 587).
To resolve this:

* Try connecting via a **mobile hotspot** or **off-campus Wi-Fi**.
* The development team is working on migrating email verification to a dedicated mail service hosted externally for future releases.
