const db = require("../config/db");
const { toProduct } = require("../models/product");

const DEFAULT_LIMIT = 40;

/**
 * Retorna o par de condição SQL + params para um token.
 *
 * Tokens longos (> 3 chars): LIKE '%token%'  — busca por substring
 * Tokens curtos (≤ 3 chars): LIKE '% token %' com espaço padding na coluna
 *   → CONCAT(' ', p.title, ' ') LIKE '% mx %'
 *   Evita falsos positivos como "ZoomX" ao buscar "mx".
 */
function tokenCondition(token) {
  if (token.length <= 3) {
    // Word-boundary simulado via CONCAT + espaço
    const pattern = `% ${token} %`;
    return {
      cond:   "(CONCAT(' ', p.title, ' ') LIKE ? OR CONCAT(' ', p.description, ' ') LIKE ?)",
      params: [pattern, pattern],
    };
  }
  const pattern = `%${token}%`;
  return {
    cond:   "(p.title LIKE ? OR p.description LIKE ?)",
    params: [pattern, pattern],
  };
}

async function searchByTerm(termObj, { limit = DEFAULT_LIMIT } = {}) {
  const safeLimit = Math.max(1, Math.min(200, parseInt(limit, 10) || DEFAULT_LIMIT));

  let specific, expanded;
  if (typeof termObj === "string") {
    specific = [];
    expanded = termObj.split(/\s+/).filter(Boolean);
  } else {
    specific = termObj.specific || [];
    expanded = termObj.expanded || [];
  }

  const activeTokens = specific.length > 0 ? specific : expanded;
  if (activeTokens.length === 0) return [];

  const parts  = activeTokens.map(tokenCondition);
  const conditions = parts.map(p => p.cond).join(" OR ");
  const params     = parts.flatMap(p => p.params);

  const scoreToken   = activeTokens[0];
  const scorePattern = `%${scoreToken}%`;

  const [rows] = await db.execute(
    `SELECT
        p.id, p.navigation_id, p.title, p.description, p.price,
        p.seller, p.qty_sold_last_30_days, p.image, p.category_id,
        p.stock, p.is_active, p.rating_average, p.rating_count,
        c.name AS category_name,
        (
          CASE WHEN p.stock > 0       THEN 100 ELSE 0 END
        + CASE WHEN p.title LIKE ?    THEN 50  ELSE 0 END
        + CASE WHEN c.name  LIKE ?    THEN 30  ELSE 0 END
        + LEAST(p.qty_sold_last_30_days / 10, 10)
        ) AS relevance_score
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.is_active = 1
       AND (${conditions})
     ORDER BY relevance_score DESC, p.qty_sold_last_30_days DESC
     LIMIT ${safeLimit}`,
    [scorePattern, scorePattern, ...params]
  );

  return rows.map(toProduct);
}

module.exports = { searchByTerm };