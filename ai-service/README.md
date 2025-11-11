

# AI Service

The **AI Service** is a Node.js + Express microservice that provides AI-powered code explanations and insights for PeerPrep.
It integrates with **Google Gemini** to generate context-aware natural language explanations for coding questions and user-submitted solutions.
This service is designed to be lightweight, stateless, and easily deployable via Docker.

---

## Features

* AI-generated explanations for code snippets and questions
* Integration with the Collaboration Service and Question Service
* Secure API key management for Gemini API
* Environment-based configuration for local and production setups
* Docker-ready for deployment

---

## Project Structure

```
ai-service/
├── src/
│   ├── controller/
│   │   ├── aiController.js      # Core logic for AI explanation requests
│   │   ├── ai.routes.js         # Express route definitions
│   │   └── index.js             # Entry point for service setup
├── .env.example                 # Example environment variables
├── .env.production              # Production environment configuration
├── Dockerfile                   # Docker build configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

---

## Environment Variables

You can maintain two environment files:

* `.env` → used for local development (refer to `.env.example`)
* `.env.production` → used for Docker or production deployment

```bash
# Gemini API Configuration
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_MODEL=gemini-2.5-flash-lite

```

---

## API Endpoints

| Method | Endpoint     | Description                                |
| ------ | ------------ | ------------------------------------------ |
| `POST` | `/ai/assist` | Generate AI explanation for submitted code |
| `GET`  | `/ai/ping`   | Health check endpoint                      |

---
