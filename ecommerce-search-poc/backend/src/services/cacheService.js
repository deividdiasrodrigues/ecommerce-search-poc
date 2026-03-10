const redis = require("../config/redis");

const CACHE_TTL_SECONDS = 5 * 60; // 5 minutes
const KEY_PREFIX = "search:";

async function get(term) {
  try {
    const data = await redis.get(`${KEY_PREFIX}${term}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null; // Cache miss is non-fatal
  }
}

async function set(term, value) {
  try {
    await redis.setex(`${KEY_PREFIX}${term}`, CACHE_TTL_SECONDS, JSON.stringify(value));
  } catch {
    // Cache write failure is non-fatal
  }
}

module.exports = { get, set };
