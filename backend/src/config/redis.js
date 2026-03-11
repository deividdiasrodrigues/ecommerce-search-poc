const Redis = require("ioredis");

const client = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  lazyConnect: true,
});

client.on("connect", () => console.log("Redis connected"));
client.on("error", (err) => console.warn("Redis error (non-fatal):", err.message));

module.exports = client;
