const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Fetch products from the backend search endpoint.
 * @param {string} query
 * @returns {Promise<Array>}
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
