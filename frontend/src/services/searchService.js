const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Fetch products from the backend search endpoint.
 */
export async function searchProducts(query) {
  const url = `${API_URL}/search?q=${encodeURIComponent(query)}`;
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch autocomplete suggestions for a prefix (TASK06).
 * Returns [] silently for prefixes shorter than 3 chars.
 *
 * @param {string} prefix
 * @returns {Promise<Array<{title: string, category_name: string|null}>>}
 */
export async function fetchSuggestions(prefix) {
  if (!prefix || prefix.trim().length < 3) return [];

  try {
    const url = `${API_URL}/autocomplete?q=${encodeURIComponent(prefix.trim())}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    return response.json();
  } catch {
    return []; // autocomplete failure is non-fatal
  }
}
