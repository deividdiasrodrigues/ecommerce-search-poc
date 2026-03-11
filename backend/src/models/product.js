/**
 * Maps a raw MySQL row to a clean Product object.
 * Centralises field naming and data types.
 */
function toProduct(row) {
  return {
    id:                    row.id,
    navigation_id:         row.navigation_id,
    title:                 row.title,
    description:           row.description,
    price:                 parseFloat(row.price),
    seller:                row.seller,
    qty_sold_last_30_days: row.qty_sold_last_30_days,
    image:                 row.image,
    category_id:           row.category_id,
    category_name:         row.category_name || null,
    stock:                 row.stock,
    is_active:             Boolean(row.is_active),
    rating_average:        parseFloat(row.rating_average),
    rating_count:          row.rating_count,
    // TASK05: relevance score exposed for debugging (stripped in production if needed)
    relevance_score:       row.relevance_score !== undefined ? row.relevance_score : null,
  };
}

module.exports = { toProduct };
