/**
 * Testes unitários — Correção Ortográfica (Levenshtein)
 */
const { correctToken, correctSpelling, levenshtein } = require("../services/fuzzyCorrector");

let passed = 0, failed = 0;

function assert(desc, actual, expected) {
  const ok = actual === expected;
  if (ok) { console.log(`  ✅ ${desc}`); passed++; }
  else {
    console.error(`  ❌ ${desc}`);
    console.error(`     expected : "${expected}"`);
    console.error(`     received : "${actual}"`);
    failed++;
  }
}

console.log("\n── Levenshtein Distance ─────────────────────────────");
assert("strings iguais → 0",         levenshtein("iphone", "iphone"),   0);
assert("1 substituição",              levenshtein("ipone", "iphone"),    1); // i-p-o-n-e vs i-p-h-o-n-e
assert("1 inserção",                  levenshtein("iphone", "iphon"),    1);
assert("1 deleção",                   levenshtein("samsug", "samsung"),  1);
assert("strings vazias",              levenshtein("", ""),               0);
assert("uma vazia",                   levenshtein("abc", ""),            3);

console.log("\n── correctToken — typos comuns ──────────────────────");
assert("'ipone' → 'iphone'",          correctToken("ipone"),    "iphone");
assert("'samsug' → 'samsung'",        correctToken("samsug"),   "samsung");
assert("'galaxi' → 'galaxy'",         correctToken("galaxi"),   "galaxy");
assert("'notbook' → 'notebook'",      correctToken("notbook"),  "notebook");
assert("'ipade' → 'ipad'",            correctToken("ipade"),    "ipad");
assert("'headfone' → 'headphone'",    correctToken("headfone"), "headphone");

console.log("\n── correctToken — sem alteração ─────────────────────");
assert("'iphone' correto → 'iphone'", correctToken("iphone"),   "iphone");
assert("'samsung' correto → 'samsung'",correctToken("samsung"), "samsung");
assert("token curto (< 4) → intacto", correctToken("tv"),       "tv");

console.log("\n── correctToken — não corrige o que não deve ─────────");
assert("'xyz' sem similar → 'xyz'",   correctToken("xyz"),      "xyz");

console.log("\n── correctSpelling — frase ──────────────────────────");
assert("'ipone 15' → 'iphone 15'",
  correctSpelling("ipone 15"),                                   "iphone 15");
assert("'samsug galaxi' → 'samsung galaxy'",
  correctSpelling("samsug galaxi"),                              "samsung galaxy");
assert("frase sem erros intacta",
  correctSpelling("iphone samsung"),                             "iphone samsung");
assert("string vazia → ''",
  correctSpelling(""),                                           "");

console.log(`\n${"─".repeat(55)}`);
console.log(`Resultado: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
