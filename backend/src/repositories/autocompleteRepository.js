const db = require("../config/db");

const DEFAULT_LIMIT = 8;

/**
 * Returns autocomplete suggestions based on product titles.
 *
 * Source: titles of active products with highest sales volume.
 * Each suggestion includes product name and category (TASK06 req #3).
 *
 * @param {string} prefix  — raw prefix typed by user (3+ chars)
 * @param {number} limit
 * @returns {Promise<Array<{title, category_name, qty_sold_last_30_days}>>}
 */
async function suggest(prefix, { limit = DEFAULT_LIMIT } = {}) {
  const safeLimit = Math.max(1, Math.min(20, parseInt(limit, 10) || DEFAULT_LIMIT));
  const pattern   = `${prefix}%`;   // prefix match — intentionally not %prefix%

  const [rows] = await db.execute(
    `SELECT
        p.title,
        c.name AS category_name,
        p.qty_sold_last_30_days
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.is_active = 1
       AND p.stock > 0
       AND p.title LIKE ?
     ORDER BY p.qty_sold_last_30_days DESC
     LIMIT ${safeLimit}`,
    [pattern]
  );

  return rows;
}

module.exports = { suggest };
