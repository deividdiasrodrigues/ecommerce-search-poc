/**
 * Testes unitários — queryPipeline
 * TASK01: Normalização | TASK02: Filtro Semântico | TASK03: Stemming | TASK04: Sinônimos
 */
const {
  normalize, toLowerCase, removeDiacritics, normalizeSpaces,
  filterSemanticNoise,
  stem, stemWord,
  expandSynonyms,
  process: pipelineProcess,
} = require("../services/queryPipeline");

let passed = 0;
let failed = 0;

function assert(description, actual, expected) {
  if (actual === expected) {
    console.log(`  ✅ ${description}`);
    passed++;
  } else {
    console.error(`  ❌ ${description}`);
    console.error(`     expected : "${expected}"`);
    console.error(`     received : "${actual}"`);
    failed++;
  }
}

// ═══════════════════════════════════════════════════════════
// TASK01 — Normalização
// ═══════════════════════════════════════════════════════════
console.log("\n── TASK01: Normalização ─────────────────────────────");
assert("SOFA → sofa",                        toLowerCase("SOFA"),              "sofa");
assert("mantém minúsculas",                  toLowerCase("sofa"),              "sofa");
assert("cedilha ç",                          removeDiacritics("caminhao"),     "caminhao");
assert("til ã",                              removeDiacritics("maca"),         "maca");
assert("espaços duplos colapsados",          normalizeSpaces("sofa  de  linho"), "sofa de linho");
assert("Caminhão → caminhao",                normalize("Caminhão"),            "caminhao");
assert("  Sofa de Algodão   → sofa de algodao",
                                             normalize("  Sofa de Algodão  "), "sofa de algodao");
assert("string vazia → ''",                  normalize(""),                    "");

// ═══════════════════════════════════════════════════════════
// TASK02 — Filtro Semântico
// ═══════════════════════════════════════════════════════════
console.log("\n── TASK02: Filtro Semântico ─────────────────────────");
assert("'maquina de lavar barata' → 'maquina lavar'",
  filterSemanticNoise("maquina de lavar barata"),   "maquina lavar");
assert("remove artigo 'o'",
  filterSemanticNoise("o sofa"),                    "sofa");
assert("remove adjetivo 'melhor'",
  filterSemanticNoise("melhor smartphone"),         "smartphone");
assert("fallback: só stop words → devolve original",
  filterSemanticNoise("de para com"),               "de para com");

// ═══════════════════════════════════════════════════════════
// TASK03 — Stemming
// ═══════════════════════════════════════════════════════════
console.log("\n── TASK03: Stemming PT-BR ───────────────────────────");
assert("cadeiras → cadeira",   stemWord("cadeiras"),   "cadeira");
assert("smartphones → smartphone", stemWord("smartphones"), "smartphone");
assert("almofadas → almofada", stemWord("almofadas"),  "almofada");
assert("animais → animal",     stemWord("animais"),    "animal");
assert("papeis → papel",       stemWord("papeis"),     "papel");
assert("botoes → botao",       stemWord("botoes"),     "botao");
assert("tenis preservado (invariável)", stemWord("tenis"), "tenis");
assert("adidas preservado",    stemWord("adidas"),     "adidas");
assert("'tenis pretos' → 'tenis preto'", stem("tenis pretos"), "tenis preto");

// ═══════════════════════════════════════════════════════════
// TASK04 — Sinônimos
// ═══════════════════════════════════════════════════════════
console.log("\n── TASK04: Sinônimos ────────────────────────────────");

console.log("\n[expandSynonyms — token único]");
assert("'celular' → 'smartphone'",
  expandSynonyms("celular"),                        "smartphone");
assert("'televisao' → 'tv'",
  expandSynonyms("televisao"),                      "tv");
assert("'televisor' → 'tv'",
  expandSynonyms("televisor"),                      "tv");
assert("'notebook' → 'laptop'",
  expandSynonyms("notebook"),                       "laptop");
assert("'geladeira' → 'geladeira' (âncora, sem mudança)",
  expandSynonyms("geladeira"),                      "geladeira");
assert("'refrigerador' → 'geladeira'",
  expandSynonyms("refrigerador"),                   "geladeira");
assert("'fone' → 'headphone'",
  expandSynonyms("fone"),                           "headphone");
assert("'earbuds' → 'headphone'",
  expandSynonyms("earbuds"),                        "headphone");
assert("'cadeira' → 'chair'",
  expandSynonyms("cadeira"),                        "chair");
assert("'watch' → 'smartwatch'",
  expandSynonyms("watch"),                          "smartwatch");
assert("'ipad' → 'tablet'",
  expandSynonyms("ipad"),                           "tablet");
assert("'speaker' → 'speaker' (é âncora)",
  expandSynonyms("speaker"),                        "speaker");

console.log("\n[expandSynonyms — frase (multi-word alias)]");
assert("'fone ouvido' → 'headphone'",
  expandSynonyms("fone ouvido"),                    "headphone");
assert("'caixa som' → 'speaker'",
  expandSynonyms("caixa som"),                      "speaker");
assert("'maquina lavar' → 'lavadora'",
  expandSynonyms("maquina lavar"),                  "lavadora");
assert("'aspirador po' → 'aspirador'",
  expandSynonyms("aspirador po"),                   "aspirador");
assert("'cadeira escritorio' → 'chair'",
  expandSynonyms("cadeira escritorio"),             "chair");

console.log("\n[expandSynonyms — termo sem sinônimo passa intacto]");
assert("'iphone' sem sinônimo → 'iphone'",
  expandSynonyms("iphone"),                         "iphone");
assert("'samsung' → 'samsung'",
  expandSynonyms("samsung"),                        "samsung");
assert("string vazia → ''",
  expandSynonyms(""),                               "");

console.log("\n[expandSynonyms — múltiplos tokens na mesma query]");
assert("'celular samsung' → 'smartphone samsung'",
  expandSynonyms("celular samsung"),                "smartphone samsung");
assert("'notebook gamer' → 'laptop gamer'",
  expandSynonyms("notebook gamer"),                 "laptop gamer");

// ═══════════════════════════════════════════════════════════
// Pipeline completo — TASK01 + 02 + 03 + 04
// ═══════════════════════════════════════════════════════════
console.log("\n── Pipeline completo (TASK01→04) ────────────────────");
assert(
  "PRD: 'Quero ver uma geladeira de 110v barata' → 'geladeira 110v'",
  pipelineProcess("Quero ver uma geladeira de 110v barata"), "geladeira 110v"
);
assert(
  "'Televisão barata' → 'tv'",
  pipelineProcess("Televisão barata"),              "tv"
);
assert(
  "'Cadeiras para escritório' → 'chair escritorio'",
  pipelineProcess("Cadeiras para escritório"),      "chair"
);
assert(
  "'Notebooks baratos' → 'laptop'",
  pipelineProcess("Notebooks baratos"),             "laptop"
);
assert(
  "'Fone de ouvido sem fio' → 'headphone fio'",
  pipelineProcess("Fone de ouvido sem fio"),        "headphone fio"
);
assert(
  "'Tênis Pretos' → 'tenis preto'",
  pipelineProcess("Tênis Pretos"),                  "tenis preto"
);
assert(
  "'Celular Samsung barato' → 'smartphone samsung'",
  pipelineProcess("Celular Samsung barato"),        "smartphone samsung"
);
assert(
  "'iphone 15' passa limpo",
  pipelineProcess("iphone 15"),                     "iphone 15"
);
assert(
  "null → ''",
  pipelineProcess(null),                            ""
);

// ═══════════════════════════════════════════════════════════
// Resultado
// ═══════════════════════════════════════════════════════════
console.log(`\n${"─".repeat(55)}`);
console.log(`Resultado: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
