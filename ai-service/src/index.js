import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// ---- env & config ----
const PORT = Number(process.env.PORT || 5055);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// for docker internal calls from other services
const ALLOWED_INTERNALS = (process.env.ALLOWED_INTERNALS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl/postman
      if (origin === FRONTEND_URL) return cb(null, true);
      if (ALLOWED_INTERNALS.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true
  })
);
app.use(morgan("tiny"));

// health checks
app.get("/health", (_req, res) => res.json({ ok: true, service: "ai-service" }));
app.get("/ping", (_req, res) => res.send("pong"));

// routes
import aiRouter from "./ai.routes.js";
app.use("/ai", aiRouter);

// error guard
app.use((err, _req, res, _next) => {
  console.error("[ai-service] error:", err);
  res.status(500).json({ ok: false, error: "Internal error" });
});

app.listen(PORT, () => {
  console.log(`[ai-service] listening on http://0.0.0.0:${PORT}`);
});
