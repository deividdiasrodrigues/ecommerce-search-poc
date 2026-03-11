const autocompleteRepository = require("../repositories/autocompleteRepository");
const cacheService            = require("./cacheService");

const MIN_PREFIX_LENGTH = 3;
const CACHE_PREFIX      = "autocomplete:";
const CACHE_TTL         = 2 * 60; // 2 min — shorter than search TTL

/**
 * Returns up to 8 title suggestions for a given prefix.
 *
 * - Rejects prefixes shorter than 3 chars (TASK06 req #1)
 * - Normalises prefix: lowercase + trim (raw — NOT full pipeline, to
 *   preserve the user's actual casing for prefix matching in SQL)
 * - Caches results in Redis with a short TTL
 *
 * @param {string} rawPrefix
 * @returns {Promise<Array<{title, category_name}>>}
 */
async function autocomplete(rawPrefix) {
  if (!rawPrefix || rawPrefix.trim().length < MIN_PREFIX_LENGTH) return [];

  const prefix = rawPrefix.trim().toLowerCase();

  // Cache check
  const cacheKey = `${CACHE_PREFIX}${prefix}`;
  try {
    const cached = await cacheService.getRaw(cacheKey);
    if (cached) {
      console.log(`[Autocomplete Cache HIT] prefix="${prefix}"`);
      return cached;
    }
  } catch { /* non-fatal */ }

  const rows = await autocompleteRepository.suggest(prefix);

  const suggestions = rows.map((r) => ({
    title:         r.title,
    category_name: r.category_name || null,
  }));

  // Cache write
  try {
    await cacheService.setRaw(cacheKey, suggestions, CACHE_TTL);
    console.log(`[Autocomplete Cache MISS] prefix="${prefix}" — ${suggestions.length} suggestions`);
  } catch { /* non-fatal */ }

  return suggestions;
}

module.exports = { autocomplete };
