const productRepository = require("../repositories/productRepository");
const cacheService      = require("./cacheService");
const queryPipeline     = require("./queryPipeline");

async function search(rawTerm) {
  if (!rawTerm || rawTerm.trim() === "") return [];

  const termObj = queryPipeline.process(rawTerm);
  if (!termObj.raw) return [];

  // Cache usa a string "raw" como chave
  const cached = await cacheService.get(termObj.raw);
  if (cached) {
    console.log(`[Cache HIT] term="${termObj.raw}"`);
    return cached;
  }

  const results = await productRepository.searchByTerm(termObj);

  await cacheService.set(termObj.raw, results);
  console.log(`[Cache MISS] term="${termObj.raw}" — ${results.length} results stored`);

  return results;
}

module.exports = { search };