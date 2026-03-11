/**
 * Dicionário de termos conhecidos para fuzzy matching (TASK — correção ortográfica).
 *
 * Construído em runtime a partir de:
 *  1. Títulos dos produtos no banco (via seed)
 *  2. Aliases e âncoras do dicionário de sinônimos
 *
 * Exporta um Set para lookup O(1) e um Array ordenado para busca fuzzy.
 */

const path    = require("path");
const fs      = require("fs");
const synonymsConfig = require("./synonyms.json");

// ── Carrega palavras dos títulos do seed ──────────────────────────────────────
// Em produção isso viria de uma query ao banco; aqui usamos o seed como fonte.
const seedPath = path.join(__dirname, "../../../database/seed.sql");

function loadSeedTitleWords() {
  try {
    const seed   = fs.readFileSync(seedPath, "utf8");
    const titles = [...seed.matchAll(/'PROD-\d+',\s*'([^']+)'/g)].map(m => m[1]);
    return titles
      .flatMap(t => t.toLowerCase().split(/\s+/))
      .map(w => w.replace(/[^a-z0-9]/g, ""))
      .filter(w => w.length >= 3);
  } catch {
    return [];
  }
}

// ── Carrega palavras do dicionário de sinônimos ───────────────────────────────
function loadSynonymWords() {
  const words = [];
  for (const group of synonymsConfig.groups) {
    group.anchor.split(/\s+/).forEach(w => words.push(w.trim()));
    group.aliases.forEach(alias =>
      alias.split(/\s+/).forEach(w => words.push(w.trim()))
    );
  }
  return words.filter(w => w.length >= 3);
}

const allWords = [...new Set([...loadSeedTitleWords(), ...loadSynonymWords()])]
  // Filtra tokens puramente numéricos ou muito curtos — não úteis para correção
  .filter(w => w.length >= 3 && /[a-z]/.test(w))
  .sort();

module.exports = allWords;
