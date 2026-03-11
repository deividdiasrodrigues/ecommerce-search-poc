/**
 * Query Pipeline — Motor de Busca Inteligente
 *
 * TASK01 — Normalização base
 * TASK02 — Filtro Semântico
 * TASK03 — Stemming PT-BR
 * TASK04 — Expansão de Sinônimos
 *
 * process() retorna um objeto { specific, expanded } para o repository
 * conseguir construir a query correta:
 *   - specific : tokens que o usuário escreveu diretamente (marcas, modelos)
 *   - expanded : tokens gerados por expansão de sinônimos (alternativas de categoria)
 *
 * Quando há tokens específicos, o SQL aplica:
 *   WHERE (título contém ALGUM token específico)   ← AND obrigatório
 *     AND (título contém ALGUM token expandido OU algum token específico)
 *
 * Quando não há tokens específicos, busca normal por OR entre todos.
 */

const semanticFilter    = require("../config/semanticFilter.json");
const stemmerExceptions = require("../config/stemmerExceptions.json");
const synonymsConfig    = require("../config/synonyms.json");
const { correctSpelling } = require("./fuzzyCorrector");

// ── Sets pré-computados ───────────────────────────────────────────────────────
const NOISE_WORDS = new Set([
  ...semanticFilter.stopWords,
  ...semanticFilter.subjectiveAdjectives,
]);
const INVARIABLE = new Set(stemmerExceptions.invariable);

// Mapa: alias → [anchor tokens]
// Ex: "celular" → ["iphone","samsung","galaxy","pixel","motorola","xiaomi"]
const SYNONYM_MAP = new Map();
// Set de todos os tokens que são âncoras (termos reais do catálogo)
const ANCHOR_TOKENS = new Set();

for (const group of synonymsConfig.groups) {
  const anchorTokens = group.anchor.split(/\s+/).filter(Boolean);
  anchorTokens.forEach((t) => ANCHOR_TOKENS.add(t));
  for (const alias of group.aliases) {
    SYNONYM_MAP.set(alias.trim(), anchorTokens);
  }
}

// ─── TASK 01 ──────────────────────────────────────────────────────────────────

function toLower(term)    { return term.toLowerCase(); }
function normalizeSpaces(term){ return term.trim().replace(/\s+/g, " "); }

function removeDiacritics(term) {
  return term
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

function normalize(term) {
  if (!term || typeof term !== "string") return "";
  return normalizeSpaces(removeDiacritics(toLower(term)));
}

// ─── TASK 02 ──────────────────────────────────────────────────────────────────

function filterSemanticNoise(term) {
  if (!term) return "";
  const tokens = term.split(" ");
  const meaningful = tokens.filter((w) => w && !NOISE_WORDS.has(w));
  return meaningful.length === 0 ? term : meaningful.join(" ");
}

// ─── TASK 03 ──────────────────────────────────────────────────────────────────

function stemWord(word) {
  if (!word || word.length <= 2) return word;
  if (INVARIABLE.has(word))      return word;
  if (word.endsWith("oes") && word.length > 4) return word.slice(0, -3) + "ao";
  if (word.endsWith("aes") && word.length > 4) return word.slice(0, -3) + "ao";
  if (word.endsWith("ais") && word.length > 4) return word.slice(0, -2) + "l";
  if (word.endsWith("eis") && word.length > 4) return word.slice(0, -2) + "l";
  if (word.endsWith("is")  && word.length > 4) {
    const r = word.slice(0, -2);
    if (r.length >= 3) return r + "il";
  }
  if (word.endsWith("ns") && word.length > 3) return word.slice(0, -1);
  if (word.endsWith("es") && word.length > 4) {
    const radical  = word.slice(0, -2);
    const minusS   = word.slice(0, -1);
    const last     = radical[radical.length - 1];
    const vowels   = new Set(["a","e","i","o","u"]);
    const natStems = new Set(["r","l","z","s"]);
    if (vowels.has(last))                          return minusS;
    if (natStems.has(last) && radical.length <= 6) return radical;
    return minusS;
  }
  if (word.endsWith("s") && word.length > 3) {
    const r = word.slice(0, -1);
    if (r.length >= 3) return r;
  }
  return word;
}

function stem(term) {
  if (!term) return "";
  return term.split(" ").map(stemWord).join(" ");
}

// ─── TASK 04 ──────────────────────────────────────────────────────────────────

/**
 * Classifica cada token em:
 *   - alias   → token é um sinônimo conhecido (ex: "celular", "televisao")
 *   - specific → token não é alias (ex: "samsung", "iphone", "15", "wireless")
 *
 * Retorna { specific: string[], expanded: string[] }
 *
 * specific : tokens que o usuário escreveu e NÃO são aliases
 * expanded : tokens âncora resultantes da expansão dos aliases
 *            (não duplica tokens que já estão em specific)
 */
function expandSynonyms(term) {
  if (!term) return { specific: [], expanded: [] };

  let result = term;

  // Passagem 1 — frases multi-word (maior → menor)
  const phraseAliases = [...SYNONYM_MAP.keys()]
    .filter((a) => a.includes(" "))
    .sort((a, b) => b.length - a.length);

  const usedPhraseAnchors = [];

  for (const alias of phraseAliases) {
    if (result.includes(alias)) {
      const anchors = SYNONYM_MAP.get(alias);
      usedPhraseAnchors.push(...anchors);
      result = normalizeSpaces(result.split(alias).join(" "));
    }
  }

  // Passagem 2 — tokens individuais
  const inputTokens = result.split(" ").filter(Boolean);
  const specific   = [];
  const fromAliases = [...usedPhraseAnchors];

  for (const token of inputTokens) {
    const anchors = SYNONYM_MAP.get(token);
    if (anchors) {
      // É um alias — adiciona âncoras à lista de expansão
      fromAliases.push(...anchors);
    } else {
      // É um token específico do usuário
      specific.push(token);
    }
  }

  // Remove dos expanded os tokens que já estão em specific (evita redundância)
  const specificSet = new Set(specific);
  const seen = new Set(specific); // seed com specific para deduplicar expanded também
  const expanded = [];
  for (const t of fromAliases) {
    if (!seen.has(t)) {
      seen.add(t);
      expanded.push(t);
    }
  }

  return { specific, expanded };
}

// ─── Pipeline principal ───────────────────────────────────────────────────────

/**
 * @param {string} rawTerm
 * @returns {{ specific: string[], expanded: string[], raw: string }}
 *   specific — tokens diretos do usuário (marcas, modelos, specs)
 *   expanded — tokens gerados por expansão de sinônimos
 *   raw      — string única (specific + expanded) para uso simples / cache key
 */
function process(rawTerm) {
  if (!rawTerm || typeof rawTerm !== "string") {
    return { specific: [], expanded: [], raw: "" };
  }

  let term = rawTerm;
  term = normalize(term);
  term = filterSemanticNoise(term);
  term = stem(term);
  term = correctSpelling(term);  // correção ortográfica fuzzy

  const { specific, expanded } = expandSynonyms(term);
  const raw = [...specific, ...expanded].join(" ");

  return { specific, expanded, raw };
}

module.exports = {
  process,
  normalize, toLowerCase: toLower, removeDiacritics, normalizeSpaces,
  filterSemanticNoise,
  stem, stemWord,
  expandSynonyms,
};