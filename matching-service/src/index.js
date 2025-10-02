require("dotenv").config();
const app = require("./app");
const { initRedis } = require("./matching/lib/redis");

const PORT = Number(process.env.PORT || 4100);

(async () => {
    try {
        await initRedis(); // connect to Redis before starting HTTP
        app.listen(PORT, () => {
            console.log(`[matching-service] listening on http://localhost:${PORT}`);
        });
    } catch (e) {
        console.error("Failed to start matching-service:", e);
        process.exit(1);
    }
})();
