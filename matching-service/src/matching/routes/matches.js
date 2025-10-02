const { Router } = require("express");
const { randomUUID } = require("crypto");
const {
    acquireUserLock,
    releaseUserLock,
    getRequest,
    pairOrEnqueueAtomic
} = require("../queue/redisMatchingQueue");

const r = Router();

/**
 * POST /api/matching/matches
 * Body: { "difficulty": "MEDIUM", "topic": "Graphs" }
 * Header (dev): X-User-Id: <someUser>
 *
 * Returns:
 *  - 201 { requestId, status: "MATCHED", counterpartReqId }
 *  - 202 { requestId, status: "SEARCHING", expiresInSec }
 *  - 409 if user already searching
 */
r.post("/matches", async (req, res) => {
    try {
        const headerUserId = req.get("X-User-Id");
        const userId = headerUserId || (req.user && req.user.id) || "devUser";

        const { difficulty, topic } = req.body || {};
        if (!difficulty || !topic) {
            return res.status(400).json({ error: "difficulty & topic required" });
        }

        const requestId = `req_${randomUUID()}`;

        // prevent duplicate concurrent searches
        const gotLock = await acquireUserLock(userId, requestId);
        if (!gotLock) {
            return res.status(409).json({ error: "user already searching or matched" });
        }

        // atomic pair-or-enqueue
        const now = Date.now();
        const counterpartReqId = await pairOrEnqueueAtomic(requestId, userId, difficulty, topic, now);

        if (counterpartReqId) {
            // dev convenience: release both locks to allow immediate re-tests
            const thisReq = await getRequest(requestId);
            const thatReq = await getRequest(counterpartReqId);
            if (thisReq?.userId) await releaseUserLock(thisReq.userId);
            if (thatReq?.userId) await releaseUserLock(thatReq.userId);

            return res.status(201).json({ requestId, status: "MATCHED", counterpartReqId });
        }

        return res.status(202).json({
            requestId,
            status: "SEARCHING",
            expiresInSec: Number(process.env.MATCH_REQUEST_TTL_SECONDS || 60)
        });
    } catch (e) {
        console.error("POST /matches error:", e);
        res.status(500).json({ error: "internal_error", detail: String(e) });
    }
});

/**
 * GET /api/matching/matches/:requestId
 * Returns the request status + metadata
 */
r.get("/matches/:requestId", async (req, res) => {
    try {
        const { requestId } = req.params;
        const reqHash = await getRequest(requestId);
        if (!reqHash) return res.status(404).json({ error: "not_found" });
        res.json({ requestId, ...reqHash });
    } catch (e) {
        console.error("GET /matches/:id error:", e);
        res.status(500).json({ error: "internal_error", detail: String(e) });
    }
});

module.exports = r;
