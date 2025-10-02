const { redis } = require("../lib/redis");

const REQ_TTL = Number(process.env.MATCH_REQUEST_TTL_SECONDS || 60);
const LOCK_TTL = Number(process.env.USER_LOCK_TTL_SECONDS || 60);

// key builders
const keyQ    = (difficulty, topic) => `queue:${difficulty}:${topic}`;
const keyReq  = (rid) => `req:${rid}`;
const keyLock = (uid) => `lock:user:${uid}`;

// user lock: one active search per user
async function acquireUserLock(userId, requestId) {
    // NX + EX: set if absent, auto-expire
    return await redis.set(keyLock(userId), requestId, { NX: true, EX: LOCK_TTL });
}
async function releaseUserLock(userId) {
    await redis.del(keyLock(userId));
}

async function getRequest(requestId) {
    const data = await redis.hGetAll(keyReq(requestId));
    return Object.keys(data).length ? data : null;
}
async function setRequestStatus(requestId, status) {
    await redis.hSet(keyReq(requestId), { status });
    await redis.expire(keyReq(requestId), REQ_TTL);
}

// ---- Atomic pair-or-enqueue via Lua ----
const MATCH_LUA = `
local queueKey   = KEYS[1]
local reqPrefix  = KEYS[2]  -- "req:"
local curReqId   = ARGV[1]
local userId     = ARGV[2]
local difficulty = ARGV[3]
local topic      = ARGV[4]
local nowMs      = ARGV[5]
local reqTtl     = tonumber(ARGV[6])

-- Try to pop someone waiting (oldest)
local popped = redis.call('ZPOPMIN', queueKey, 1)

if popped and #popped >= 1 then
  local counterpartId = popped[1]
  -- Mark current request MATCHED (create/update hash)
  redis.call('HSET', reqPrefix .. curReqId,
    'userId', userId,
    'difficulty', difficulty,
    'topic', topic,
    'status', 'MATCHED',
    'createdAt', nowMs
  )
  redis.call('EXPIRE', reqPrefix .. curReqId, reqTtl)

  -- Mark counterpart MATCHED
  redis.call('HSET', reqPrefix .. counterpartId, 'status', 'MATCHED')
  redis.call('EXPIRE', reqPrefix .. counterpartId, reqTtl)

  return counterpartId
end

-- No partner -> create/update as SEARCHING and enqueue
redis.call('HSET', reqPrefix .. curReqId,
  'userId', userId,
  'difficulty', difficulty,
  'topic', topic,
  'status', 'SEARCHING',
  'createdAt', nowMs
)
redis.call('EXPIRE', reqPrefix .. curReqId, reqTtl)

redis.call('ZADD', queueKey, nowMs, curReqId)
return nil
`;

async function pairOrEnqueueAtomic(requestId, userId, difficulty, topic, nowMs) {
    const counterpartReqId = await redis.eval(MATCH_LUA, {
        keys: [keyQ(difficulty, topic), "req:"],
        arguments: [requestId, userId, difficulty, topic, String(nowMs), String(REQ_TTL)]
    });
    return counterpartReqId || null; // string or null
}

module.exports = {
    acquireUserLock,
    releaseUserLock,
    getRequest,
    setRequestStatus,
    pairOrEnqueueAtomic
};
