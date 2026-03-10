const db = require("../config/db");
const { toProduct } = require("../models/product");

const DEFAULT_LIMIT = 40;

/**
 * Search products in MySQL using LIKE on title and description.
 * Joins categories to enrich results.
 * Orders by qty_sold_last_30_days DESC for relevance-like sorting.
 */
async function searchByTerm(term, { limit = DEFAULT_LIMIT } = {}) {
  const pattern = `%${term}%`;
  // LIMIT cannot be passed as a prepared statement parameter in mysql2 —
  // interpolate it directly after sanitizing to a safe integer.
  const safeLimit = Math.max(1, Math.min(200, parseInt(limit, 10) || DEFAULT_LIMIT));

  const [rows] = await db.execute(
    `SELECT
        p.id, p.navigation_id, p.title, p.description, p.price,
        p.seller, p.qty_sold_last_30_days, p.image, p.category_id,
        p.rating_average, p.rating_count,
        c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.title LIKE ? OR p.description LIKE ?
     ORDER BY p.qty_sold_last_30_days DESC
     LIMIT ${safeLimit}`,
    [pattern, pattern]
  );

  return rows.map(toProduct);
}

module.exports = { searchByTerm };
