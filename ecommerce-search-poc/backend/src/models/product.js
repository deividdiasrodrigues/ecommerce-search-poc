/**
 * Maps a raw MySQL row to a clean Product object.
 * Centralises field naming and data types.
 */
function toProduct(row) {
  return {
    id: row.id,
    navigation_id: row.navigation_id,
    title: row.title,
    description: row.description,
    price: parseFloat(row.price),
    seller: row.seller,
    qty_sold_last_30_days: row.qty_sold_last_30_days,
    image: row.image,
    category_id: row.category_id,
    category_name: row.category_name || null,
    rating_average: parseFloat(row.rating_average),
    rating_count: row.rating_count,
  };
}

module.exports = { toProduct };
