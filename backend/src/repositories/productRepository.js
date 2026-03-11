const db = require("../config/db");
const { toProduct } = require("../models/product");

const DEFAULT_LIMIT = 40;

/**
 * Busca produtos com ranking de relevância (TASK05).
 *
 * Recebe { specific, expanded } do pipeline:
 *
 *   specific : tokens que o usuário escreveu diretamente (samsung, iphone, 15, wireless)
 *   expanded : tokens gerados por expansão de sinônimos (iphone, galaxy, pixel...)
 *              — usados APENAS quando specific está vazio
 *
 * Lógica de filtragem:
 *
 *   COM specific  → filtra só por specific (OR entre eles)
 *     "smartphone samsung" → WHERE title LIKE '%samsung%'
 *     "smartphone iphone"  → WHERE title LIKE '%iphone%'
 *     "iphone 15"          → WHERE title LIKE '%iphone%' OR title LIKE '%15%'
 *
 *   SEM specific  → filtra por expanded (OR entre eles)
 *     "smartphone"         → WHERE title LIKE '%iphone%' OR ... OR title LIKE '%xiaomi%'
 *     "celular"            → idem
 *
 * Isso garante que a marca especificada pelo usuário seja sempre respeitada,
 * independente de qual alias de categoria foi usado.
 */
async function searchByTerm(termObj, { limit = DEFAULT_LIMIT } = {}) {
  const safeLimit = Math.max(1, Math.min(200, parseInt(limit, 10) || DEFAULT_LIMIT));

  // Suporte a chamada legada com string simples
  let specific, expanded;
  if (typeof termObj === "string") {
    specific = [];
    expanded = termObj.split(/\s+/).filter(Boolean);
  } else {
    specific = termObj.specific || [];
    expanded = termObj.expanded || [];
  }

  // Tokens efetivos: specific tem prioridade; expanded só entra se specific vazio
  const activeTokens = specific.length > 0 ? specific : expanded;
  if (activeTokens.length === 0) return [];

  // Constrói OR entre todos os tokens ativos
  const conditions = activeTokens
    .map(() => "(p.title LIKE ? OR p.description LIKE ?)")
    .join(" OR ");

  const params = activeTokens.flatMap((t) => [`%${t}%`, `%${t}%`]);

  // Score baseado no token mais relevante (primeiro specific ou primeiro expanded)
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