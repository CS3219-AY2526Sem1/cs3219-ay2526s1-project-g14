const { redis } = require("../lib/redis");

const REQ_TTL = Number(process.env.MATCH_REQUEST_TTL_SECONDS || 60);
const LOCK_TTL = Number(process.env.USER_LOCK_TTL_SECONDS || 60);

const keyQ    = (difficulty, topic) => `queue:${difficulty}:${topic}`;
const keyReq  = (rid) => `req:${rid}`;
const keyLock = (uid) => `lock:user:${uid}`;

async function acquireUserLock(userId, requestId) {
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
local queueKey     = KEYS[1]
local reqPrefix    = KEYS[2]  -- "req:"
local curReqId     = ARGV[1]
local userId       = ARGV[2]
local username     = ARGV[3]
local difficulty   = ARGV[4]
local topic        = ARGV[5]
local nowMs        = ARGV[6]
local reqTtl       = tonumber(ARGV[7])

-- Try to pop oldest waiting request
local popped = redis.call('ZPOPMIN', queueKey, 1)

if popped and #popped >= 1 then
  local counterpartId = popped[1]

  -- fetch counterpart username
  local counterpartUser = redis.call('HGET', reqPrefix .. counterpartId, 'username')
  if not counterpartUser then counterpartUser = '' end

  -- Make up a roomId based on the current request (simple deterministic)
  local roomId = 'room:' .. curReqId

  -- Mark current request MATCHED with partner + room
  redis.call('HSET', reqPrefix .. curReqId,
    'userId', userId,
    'username', username,
    'difficulty', difficulty,
    'topic', topic,
    'status', 'MATCHED',
    'partnerUsername', counterpartUser,
    'roomId', roomId,
    'createdAt', nowMs
  )
  redis.call('EXPIRE', reqPrefix .. curReqId, reqTtl)

  -- Mark counterpart MATCHED with partner + room
  redis.call('HSET', reqPrefix .. counterpartId,
    'status', 'MATCHED',
    'partnerUsername', username,
    'roomId', roomId
  )
  redis.call('EXPIRE', reqPrefix .. counterpartId, reqTtl)

  return counterpartId
end

-- No partner -> record SEARCHING & enqueue (also store username so future partner can show it)
redis.call('HSET', reqPrefix .. curReqId,
  'userId', userId,
  'username', username,
  'difficulty', difficulty,
  'topic', topic,
  'status', 'SEARCHING',
  'createdAt', nowMs
)
redis.call('EXPIRE', reqPrefix .. curReqId, reqTtl)

redis.call('ZADD', queueKey, nowMs, curReqId)
return nil
`;

async function pairOrEnqueueAtomic(requestId, userId, username,difficulty, topic, nowMs) {
    const counterpartReqId = await redis.eval(MATCH_LUA, {
        keys: [keyQ(difficulty, topic), "req:"],
        arguments: [requestId, userId, difficulty, topic, String(nowMs), String(REQ_TTL)]
    });
    return counterpartReqId || null; // string or null
}

async function removeFromQueue(requestId, difficulty, topic) {
    await redis.zRem(keyQ(difficulty, topic), requestId);
  }
  
  async function cancelRequest(requestId) {
    const r = await getRequest(requestId);
    if (!r) return;
    if (r.status === 'SEARCHING') {
      await removeFromQueue(requestId, r.difficulty, r.topic);
      await setRequestStatus(requestId, 'CANCELLED');
      if (r.userId) await releaseUserLock(r.userId);
    }
  }
  

module.exports = {
    acquireUserLock,
    releaseUserLock,
    getRequest,
    setRequestStatus,
    pairOrEnqueueAtomic,
    removeFromQueue,
    cancelRequest,
};
