const { Router } = require("express");
const { redis } = require("../lib/redis");

const r = Router();

// liveness/readiness: confirms Redis connectivity
r.get("/health", async (_req, res) => {
    try {
        await redis.ping();
        res.json({ ok: true, redis: "up" });
    } catch (e) {
        res.status(500).json({ ok: false, redis: "down", error: String(e) });
    }
});

module.exports = r;
