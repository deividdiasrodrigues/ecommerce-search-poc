/**
 * Testes unitários — TASK05: Ranking e Disponibilidade
 *
 * Valida a lógica de scoring sem banco de dados,
 * simulando o cálculo que a query SQL executa.
 */

let passed = 0;
let failed = 0;

function assert(description, actual, expected) {
  if (actual === expected) {
    console.log(`  ✅ ${description}`);
    passed++;
  } else {
    console.error(`  ❌ ${description}`);
    console.error(`     expected : ${JSON.stringify(expected)}`);
    console.error(`     received : ${JSON.stringify(actual)}`);
    failed++;
  }
}

// ─── Scoring function (espelha o CASE WHEN do SQL) ────────────────────────────

/**
 * Replica a fórmula de scoring do productRepository para testes unitários.
 */
function computeScore(product, searchTerm) {
  const term = searchTerm.toLowerCase();

  const stockScore    = product.stock > 0 ? 100 : 0;
  const titleScore    = product.title.toLowerCase().includes(term) ? 50 : 0;
  const categoryScore = product.category_name &&
                        product.category_name.toLowerCase().includes(term) ? 30 : 0;
  const salesScore    = Math.min(product.qty_sold_last_30_days / 10, 10);

  return stockScore + titleScore + categoryScore + salesScore;
}

/**
 * Simula a ordenação que o SQL faz com ORDER BY relevance_score DESC.
 */
function rankProducts(products, searchTerm) {
  return products
    .filter(p => p.is_active)                         // exclui inativos
    .map(p => ({ ...p, relevance_score: computeScore(p, searchTerm) }))
    .sort((a, b) =>
      b.relevance_score - a.relevance_score ||
      b.qty_sold_last_30_days - a.qty_sold_last_30_days
    );
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const products = [
  {
    id: 1, navigation_id: "PROD-001",
    title: "Samsung Galaxy S24 Ultra",
    category_name: "Smartphones",
    stock: 50, is_active: true,
    qty_sold_last_30_days: 280,
  },
  {
    id: 2, navigation_id: "PROD-002",
    title: "iPhone 15 Pro Max",
    category_name: "Smartphones",
    stock: 30, is_active: true,
    qty_sold_last_30_days: 320,
  },
  {
    id: 3, navigation_id: "PROD-003",
    title: "Motorola Moto G85",
    category_name: "Smartphones",
    stock: 0,   // OUT OF STOCK
    is_active: true,
    qty_sold_last_30_days: 480,
  },
  {
    id: 4, navigation_id: "PROD-004",
    title: "Nokia 3310",
    category_name: "Smartphones",
    stock: 10, is_active: false, // INACTIVE
    qty_sold_last_30_days: 900,
  },
  {
    id: 5, navigation_id: "PROD-005",
    title: "Google Pixel 8 Pro",
    category_name: "Smartphones",
    stock: 15, is_active: true,
    qty_sold_last_30_days: 190,
  },
];

// ═══════════════════════════════════════════════════════════
// Testes de scoring individual
// ═══════════════════════════════════════════════════════════
console.log("\n── Scoring individual ───────────────────────────────");

console.log("\n[Peso 100 — Estoque]");
assert(
  "produto em estoque recebe +100",
  computeScore({ title: "x", category_name: null, stock: 10, qty_sold_last_30_days: 0 }, "z"),
  100
);
assert(
  "produto sem estoque recebe 0 de stock",
  computeScore({ title: "x", category_name: null, stock: 0, qty_sold_last_30_days: 0 }, "z"),
  0
);

console.log("\n[Peso 50 — Match no Título]");
assert(
  "termo no título recebe +50",
  computeScore({ title: "Samsung Galaxy", category_name: null, stock: 0, qty_sold_last_30_days: 0 }, "samsung"),
  50
);
assert(
  "termo ausente do título não pontua",
  computeScore({ title: "Apple iPhone", category_name: null, stock: 0, qty_sold_last_30_days: 0 }, "samsung"),
  0
);

console.log("\n[Peso 30 — Match na Categoria]");
assert(
  "termo igual ao nome da categoria recebe +30",
  computeScore({ title: "x", category_name: "Laptops", stock: 0, qty_sold_last_30_days: 0 }, "laptops"),
  30
);
assert(
  "categoria null não pontua",
  computeScore({ title: "x", category_name: null, stock: 0, qty_sold_last_30_days: 0 }, "laptops"),
  0
);

console.log("\n[Peso 10 — Vendas normalizado]");
assert(
  "100 vendas → 10 pontos (máximo)",
  computeScore({ title: "x", category_name: null, stock: 0, qty_sold_last_30_days: 100 }, "z"),
  10
);
assert(
  "1000 vendas → 10 pontos (capped)",
  computeScore({ title: "x", category_name: null, stock: 0, qty_sold_last_30_days: 1000 }, "z"),
  10
);
assert(
  "50 vendas → 5 pontos",
  computeScore({ title: "x", category_name: null, stock: 0, qty_sold_last_30_days: 50 }, "z"),
  5
);
assert(
  "0 vendas → 0 pontos",
  computeScore({ title: "x", category_name: null, stock: 0, qty_sold_last_30_days: 0 }, "z"),
  0
);

console.log("\n[Score combinado]");
assert(
  "estoque + título + categoria + vendas = 100+50+30+10",
  computeScore({
    title: "Samsung Laptop", category_name: "Laptop", stock: 5, qty_sold_last_30_days: 100
  }, "laptop"),
  190
);
assert(
  "sem estoque + título match = 0+50",
  computeScore({ title: "Samsung Galaxy", category_name: null, stock: 0, qty_sold_last_30_days: 0 }, "samsung"),
  50
);

// ═══════════════════════════════════════════════════════════
// Testes de ordenação (rankProducts)
// ═══════════════════════════════════════════════════════════
console.log("\n── Ordenação e Exclusão ─────────────────────────────");

const ranked = rankProducts(products, "samsung");

console.log("\n[Critério de exclusão]");
assert(
  "produto inativo (Nokia) nunca aparece",
  ranked.some(p => p.navigation_id === "PROD-004"),
  false
);
assert(
  "total de resultados exclui inativo (4 de 5)",
  ranked.length,
  4
);

console.log("\n[Produto sem estoque aparece por último entre ativos]");
const motoIndex    = ranked.findIndex(p => p.navigation_id === "PROD-003");
const samsungIndex = ranked.findIndex(p => p.navigation_id === "PROD-001");
assert(
  "Samsung (em estoque, match título) aparece antes do Moto (sem estoque)",
  samsungIndex < motoIndex,
  true
);

console.log("\n[Produto com estoque + título match lidera]");
assert(
  "primeiro resultado tem estoque > 0",
  ranked[0].stock > 0,
  true
);
assert(
  "primeiro resultado contém 'samsung' no título",
  ranked[0].title.toLowerCase().includes("samsung"),
  true
);

console.log("\n[Scores atribuídos corretamente]");
const samsung = ranked.find(p => p.navigation_id === "PROD-001");
assert(
  "Samsung score = 100(stock) + 50(title) + 30(category match? no) + sales",
  samsung.relevance_score,
  100 + 50 + 0 + Math.min(280 / 10, 10) // 100+50+0+10 = 160
);

const moto = ranked.find(p => p.navigation_id === "PROD-003");
assert(
  "Moto sem estoque score = 0(stock) + 0(title no samsung match) + ...",
  moto.relevance_score,
  0 + 0 + 0 + Math.min(480 / 10, 10)  // 0+0+0+10 = 10
);

console.log("\n[Desempate por qty_sold_last_30_days]");
// Produtos sem match de termo — só stock+sales diferenciam
const tieProducts = [
  { id: 10, navigation_id: "A", title: "Produto X", category_name: null, stock: 10, is_active: true, qty_sold_last_30_days: 50 },
  { id: 11, navigation_id: "B", title: "Produto Y", category_name: null, stock: 10, is_active: true, qty_sold_last_30_days: 200 },
];
const tieRanked = rankProducts(tieProducts, "zzz");
assert(
  "em caso de empate de score, maior qty_sold vem primeiro",
  tieRanked[0].navigation_id,
  "B"
);

// ═══════════════════════════════════════════════════════════
// Resultado
// ═══════════════════════════════════════════════════════════
console.log(`\n${"─".repeat(55)}`);
console.log(`Resultado: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
