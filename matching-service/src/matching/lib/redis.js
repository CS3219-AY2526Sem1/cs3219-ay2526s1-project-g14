const { createClient } = require("redis");

const url = process.env.REDIS_URL || "redis://localhost:6379";
const redis = createClient({ url });

redis.on("error", (err) => console.error("[redis] error", err));

async function initRedis() {
    if (!redis.isOpen) {
        await redis.connect();
        console.log("[redis] connected:", url);
    }
}

module.exports = { redis, initRedis };
