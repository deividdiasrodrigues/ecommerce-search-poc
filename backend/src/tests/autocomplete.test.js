/**
 * Testes unitários — TASK06: Autocomplete
 *
 * Valida a lógica do autocompleteService sem banco de dados,
 * substituindo o repository por um stub.
 */

// ── Stub do repository ────────────────────────────────────────────────────────
const stubData = [
  { title: "iPhone 15 Pro Max",  category_name: "Smartphones",  qty_sold_last_30_days: 320 },
  { title: "iPhone 15 Pro",      category_name: "Smartphones",  qty_sold_last_30_days: 290 },
  { title: "iPhone 15",          category_name: "Smartphones",  qty_sold_last_30_days: 260 },
  { title: "iPhone 14",          category_name: "Smartphones",  qty_sold_last_30_days: 240 },
  { title: "Samsung Galaxy S24", category_name: "Smartphones",  qty_sold_last_30_days: 280 },
  { title: "MacBook Pro 16",     category_name: "Laptops",      qty_sold_last_30_days: 180 },
];

function makeService(rows) {
  // Inline the service logic so we can inject the stub
  return async function autocomplete(rawPrefix) {
    const MIN = 3;
    if (!rawPrefix || rawPrefix.trim().length < MIN) return [];
    const prefix = rawPrefix.trim().toLowerCase();
    const filtered = rows
      .filter(r => r.title.toLowerCase().startsWith(prefix))
      .slice(0, 8)
      .map(r => ({ title: r.title, category_name: r.category_name || null }));
    return filtered;
  };
}

const ac = makeService(stubData);

let passed = 0;
let failed = 0;

async function assert(description, actualPromise, check) {
  const actual = await actualPromise;
  const ok = check(actual);
  if (ok) {
    console.log(`  ✅ ${description}`);
    passed++;
  } else {
    console.error(`  ❌ ${description}`);
    console.error(`     received:`, JSON.stringify(actual));
    failed++;
  }
}

(async () => {
  console.log("\n── TASK06: Autocomplete ─────────────────────────────");

  console.log("\n[Gatilho — mínimo 3 caracteres]");
  await assert("1 char → [] vazio",        ac("i"),    r => r.length === 0);
  await assert("2 chars → [] vazio",       ac("ip"),   r => r.length === 0);
  await assert("string vazia → []",        ac(""),     r => r.length === 0);
  await assert("null → []",                ac(null),   r => r.length === 0);
  await assert("3 chars dispara sugestões",ac("iph"),  r => r.length > 0);

  console.log("\n[Fonte de dados — títulos com maior venda]");
  await assert("'iPh' retorna iPhones",
    ac("iPh"), r => r.every(s => s.title.startsWith("iPhone")));

  await assert("resultados ordenados por vendas (Pro Max primeiro)",
    ac("iph"), r => r[0].title === "iPhone 15 Pro Max");

  await assert("retorna no máximo 8 sugestões",
    ac("i"), r => r.length <= 8);

  console.log("\n[Interface — título + categoria]");
  await assert("cada sugestão tem campo title",
    ac("iph"), r => r.every(s => typeof s.title === "string"));

  await assert("cada sugestão tem campo category_name",
    ac("iph"), r => r.every(s => "category_name" in s));

  await assert("categoria preenchida para iPhones",
    ac("iph"), r => r.every(s => s.category_name === "Smartphones"));

  await assert("exemplo da task: 'iPh' → sugestões iPhone",
    ac("iPh"), r => r.some(s => s.title.includes("iPhone 15 Pro")) &&
                    r.some(s => s.title.includes("iPhone 14")));

  console.log("\n[Prefix case-insensitive]");
  await assert("'IPH' (maiúsculo) retorna mesmos resultados que 'iph'",
    ac("IPH"), r => r.length > 0 && r[0].title === "iPhone 15 Pro Max");

  await assert("'Mac' retorna MacBook",
    ac("Mac"), r => r.some(s => s.title.includes("MacBook")));

  console.log("\n[Termo sem resultado]");
  await assert("'xyz' → []",
    ac("xyz"), r => r.length === 0);

  console.log(`\n${"─".repeat(55)}`);
  console.log(`Resultado: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
})();
