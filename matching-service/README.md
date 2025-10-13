# Matching Service

A standalone microservice that pairs users for coding sessions based on **difficulty** and **topic**.

* **Stack:** Node.js, Express, Redis
* **Port:** `4100` by default
* **UI:** Minimal demo served at `/`

---

## Getting Started

### 1. Prerequisites

* Node.js 18+
* Redis running locally:

  ```bash
  docker run -d --name peerprep-redis -p 6379:6379 redis:7-alpine
  ```

### 2. Install & Run

```bash
cd matching-service
cp .env.sample .env
npm install
npm run dev
```

You should see:

```
[redis] connected: redis://localhost:6379
[matching-service] listening on http://localhost:4100
```

---

## Test with the UI

Open: [http://localhost:4100/](http://localhost:4100/)

* Use **User A** (default: `alice`) → click **Start Matching** → shows `SEARCHING`
* Use **User B** (default: `bob`) with the same criteria → click **Start Matching** → shows `MATCHED`
* Use **Poll Status** to confirm both requests are matched

---

## 🛠️ Test with CLI (optional)

```bash
# User A
curl -s -X POST http://localhost:4100/api/matching/matches \
  -H "Content-Type: application/json" -H "X-User-Id: alice" \
  -d '{"difficulty":"MEDIUM","topic":"Graphs"}'

# User B
curl -s -X POST http://localhost:4100/api/matching/matches \
  -H "Content-Type: application/json" -H "X-User-Id: bob" \
  -d '{"difficulty":"MEDIUM","topic":"Graphs"}'
```

