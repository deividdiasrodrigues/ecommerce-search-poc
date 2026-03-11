const redis = require("../config/redis");

const SEARCH_TTL    = 5 * 60; // 5 minutes
const SEARCH_PREFIX = "search:";

// ── Search cache (existing behaviour) ────────────────────────────────────────

async function get(term) {
  try {
    const data = await redis.get(`${SEARCH_PREFIX}${term}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

async function set(term, value) {
  try {
    await redis.setex(`${SEARCH_PREFIX}${term}`, SEARCH_TTL, JSON.stringify(value));
  } catch { /* non-fatal */ }
}

// ── Generic cache (used by autocomplete and future services) ──────────────────

async function getRaw(key) {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

async function setRaw(key, value, ttlSeconds = SEARCH_TTL) {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch { /* non-fatal */ }
}

module.exports = { get, set, getRaw, setRaw };
