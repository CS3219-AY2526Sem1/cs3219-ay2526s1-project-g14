const { Router } = require("express");
const { randomUUID } = require("crypto");
const {
    acquireUserLock,
    releaseUserLock,
    getRequest,
    pairOrEnqueueAtomic,
    setRequestStatus,
    setRequestFields,
    cancelRequest,
} = require("../queue/redisMatchingQueue");
const axios = require("axios");
const r = Router();

const COLLAB_URL = process.env.COLLAB_SERVICE_URL || "http://localhost:5050"; // backend that serves /collaboration/session
const MATCH_TTL_SECONDS = Number(process.env.MATCH_REQUEST_TTL_SECONDS || 60);

/**
 * POST /matching/matches
 * Body: { difficulty, topic, username? }
 * Header (dev): X-User-Id
 */
r.post("/matches", async (req, res) => {
  try {
    const headerUserId = req.get("X-User-Id");
    // Prefer explicit body userId, then header, then auth context, then fallback
    const userId = (req.body && req.body.userId) || headerUserId || (req.user && req.user.id) || "devUser";
    const username = req.body?.username || req.get("X-Username") || userId;

    const { difficulty, topic } = req.body || {};
    if (!difficulty || !topic) {
      return res.status(400).json({ error: "difficulty & topic required" });
    }

    const requestId = `req_${randomUUID()}`;

    // lock per user
    const gotLock = await acquireUserLock(userId, requestId);
    if (!gotLock) {
      return res.status(409).json({ error: "user already searching or matched" });
    }

    // Atomically match or enqueue
    const now = Date.now();
    const counterpartReqId = await pairOrEnqueueAtomic(requestId, userId, username, difficulty, topic, now);

    if (counterpartReqId) {
      // We have a counterpart; fetch both sides to build collab payload
      const thisReq = await getRequest(requestId);
      const thatReq = await getRequest(counterpartReqId);

      // Build the collaboration session creation payload
      const users = [
        { userId: thisReq?.userId || userId, username },
        { userId: thatReq?.userId || "unknown", username: thatReq?.username || "Partner" }
      ];

      // You can optionally fetch a real question here and pass as questionData.
      let sessionId = `room:${requestId}`;
      try {
        const createResp = await axios.post(`${COLLAB_URL}/collaboration/session`, {
          users,
          difficulty,
          topic,
        });
        const sessionData = createResp.data?.payload || {};
        if (sessionData.sessionId) sessionId = sessionData.sessionId;
      } catch (err) {
        console.warn("Collab session creation failed, using fallback room:", err?.response?.data || err?.message);
      }

      // Save partner + sessionId on both requests
      await setRequestFields(requestId, {
        status: "MATCHED",
        partnerUsername: thatReq?.username || "Partner",
        roomId: sessionId,
        topic,
        difficulty
      });
      await setRequestFields(counterpartReqId, {
        status: "MATCHED",
        partnerUsername: username,
        roomId: sessionId,
        topic,
        difficulty
      });

      // Release both locks so users can start again
      if (thisReq?.userId) await releaseUserLock(thisReq.userId);
      if (thatReq?.userId) await releaseUserLock(thatReq.userId);

      return res.status(201).json({
        requestId,
        status: "MATCHED",
        counterpartReqId,
        roomId: sessionId
      });
    }

    // Still searching
    return res.status(202).json({
      requestId,
      status: "SEARCHING",
      expiresInSec: MATCH_TTL_SECONDS
    });
  } catch (e) {
    console.error("POST /matches error:", e);
    res.status(500).json({ error: "internal_error", detail: String(e?.message || e) });
  }
});

/**
 * GET /api/matching/matches/:requestId
 */
r.get("/matches/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const reqHash = await getRequest(requestId);
    if (!reqHash) return res.status(404).json({ error: "not_found" });

    const createdAt = Number(reqHash.createdAt || 0);
    const ageMs = Date.now() - createdAt;
    if (reqHash.status === "SEARCHING" && ageMs >= MATCH_TTL_SECONDS * 1000) {
      reqHash.status = "TIMEOUT";
      await setRequestStatus(requestId, "TIMEOUT");
      // Also remove from queue and release user lock
      try {
        if (reqHash.difficulty && reqHash.topic) {
          await require("../queue/redisMatchingQueue").removeFromQueue(requestId, reqHash.difficulty, reqHash.topic);
        }
        if (reqHash.userId) {
          await releaseUserLock(reqHash.userId);
        }
      } catch (_) {}
    }

    res.json({ requestId, ...reqHash });
  } catch (e) {
    console.error("GET /matches/:id error:", e);
    res.status(500).json({ error: "internal_error", detail: String(e?.message || e) });
  }
});


r.delete("/matches/:requestId", async (req, res) => {
    try {
      const { requestId } = req.params;
      await cancelRequest(requestId);  
      res.json({ ok: true });
    } catch (e) {
      console.error("DELETE /matches/:id error:", e);
      res.status(500).json({ error: "internal_error", detail: String(e) });
    }
  });

module.exports = r;
