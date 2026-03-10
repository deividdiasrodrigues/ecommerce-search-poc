const productRepository = require("../repositories/productRepository");
const cacheService = require("./cacheService");

async function search(term) {
  if (!term || term.trim() === "") return [];

  const normalizedTerm = term.trim().toLowerCase();

  // 1. Try cache first
  const cached = await cacheService.get(normalizedTerm);
  if (cached) {
    console.log(`[Cache HIT] term="${normalizedTerm}"`);
    return cached;
  }

  // 2. Search in MySQL
  const results = await productRepository.searchByTerm(normalizedTerm);

  // 3. Populate cache
  await cacheService.set(normalizedTerm, results);
  console.log(`[Cache MISS] term="${normalizedTerm}" — ${results.length} results stored`);

  return results;
}

module.exports = { search };
