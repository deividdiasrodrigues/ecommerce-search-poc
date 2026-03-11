/**
 * Correção ortográfica por similaridade (Levenshtein Distance).
 *
 * Para cada token da query que não produz resultados conhecidos,
 * busca o termo mais próximo no dicionário de termos do catálogo.
 *
 * Regras conservadoras para evitar falsos positivos:
 *  - Só corrige se distância ≤ MAX_DISTANCE
 *  - Só corrige se o token não é muito curto (MIN_TOKEN_LENGTH)
 *  - Só corrige se o candidato começa com a mesma letra (reduz falsos positivos)
 *  - Prefere candidatos com mesmo prefixo (primeiros 2 chars iguais)
 */

const knownTerms = require("../config/knownTerms");

const MAX_DISTANCE    = 2;  // máximo de edições aceitas
const MIN_TOKEN_LEN   = 4;  // tokens muito curtos não são corrigidos

/**
 * Calcula distância de Levenshtein entre duas strings.
 * Implementação com programação dinâmica O(m*n).
 */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // Otimização: se diferença de tamanho já excede MAX_DISTANCE, descarta
  if (Math.abs(m - n) > MAX_DISTANCE) return MAX_DISTANCE + 1;

  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

/**
 * Encontra a melhor correção para um único token.
 *
 * @param {string} token — palavra possivelmente com erro ortográfico
 * @returns {string}     — token corrigido, ou o original se nenhuma correção encontrada
 */
function correctToken(token) {
  if (!token || token.length < MIN_TOKEN_LEN) return token;

  // Se o token já é um termo conhecido, não precisa corrigir
  if (knownTerms.includes(token)) return token;

  const firstChar = token[0];
  const prefix2   = token.slice(0, 2);

  let bestMatch = null;
  let bestDist  = MAX_DISTANCE + 1;

  for (const candidate of knownTerms) {
    // Otimização: só avalia candidatos que começam com a mesma letra
    if (candidate[0] !== firstChar) continue;

    const dist = levenshtein(token, candidate);
    if (dist > MAX_DISTANCE) continue;

    // Prefere candidato com mesmo prefixo de 2 chars (menos ambíguo)
    const samePrefix = candidate.slice(0, 2) === prefix2;
    const isBetter   = dist < bestDist || (dist === bestDist && samePrefix);

    if (isBetter) {
      bestDist  = dist;
      bestMatch = candidate;
    }
  }

  if (bestMatch && bestDist <= MAX_DISTANCE) {
    console.log(`[FuzzyCorrect] "${token}" → "${bestMatch}" (dist=${bestDist})`);
    return bestMatch;
  }

  return token; // sem correção
}

/**
 * Aplica correção ortográfica a cada token da query.
 *
 * @param {string} term — query normalizada (após TASK01-03)
 * @returns {string}    — query com tokens corrigidos
 */
function correctSpelling(term) {
  if (!term) return "";
  const tokens = term.split(" ").filter(Boolean);
  return tokens.map(correctToken).join(" ");
}

module.exports = { correctSpelling, correctToken, levenshtein };
