# 05 — Developer Guide & Extension Points

---

## Quick Start

```bash
# Start everything
docker compose up --build

# Start in background
docker compose up --build -d

# View logs
docker compose logs -f backend
docker compose logs -f mysql

# Stop
docker compose down

# Full reset (wipe volumes / re-seed DB)
docker compose down -v && docker compose up --build
```

---

## Local Development Without Docker

### Backend
```bash
cd backend
npm install
export DB_HOST=localhost DB_USER=app DB_PASSWORD=app_password DB_NAME=ecommerce
export REDIS_HOST=localhost
npm run dev   # nodemon with hot reload
```

### Frontend
```bash
cd frontend
npm install
# VITE_API_URL defaults to http://localhost:3001
npm run dev
```

---

## Adding Filters (Category, Price Range)

**Repository** — extend the query:
```js
// productRepository.js
async function searchByTerm(term, { categoryId, minPrice, maxPrice } = {}) {
  let sql = `SELECT ... WHERE (title LIKE ? OR description LIKE ?)`;
  const params = [pattern, pattern];

  if (categoryId) { sql += ` AND category_id = ?`; params.push(categoryId); }
  if (minPrice)   { sql += ` AND price >= ?`;      params.push(minPrice); }
  if (maxPrice)   { sql += ` AND price <= ?`;      params.push(maxPrice); }

  sql += ` ORDER BY qty_sold_last_30_days DESC LIMIT ${safeLimit}`;
}
```

**Controller** — pass through from request:
```js
const { q, category, min_price, max_price } = req.query;
const results = await searchService.search(q, { categoryId: category, minPrice: min_price, maxPrice: max_price });
```

---

## Adding Pagination

```js
// GET /search?q=laptop&page=2&limit=20
const page  = parseInt(req.query.page)  || 1;
const limit = parseInt(req.query.limit) || 40;
const offset = (page - 1) * limit;
// Add OFFSET ${safeOffset} to SQL in repository
```

---

## Upgrading MySQL Search

The schema already has a FULLTEXT index on `title` and `description`.
Switch from LIKE to MATCH AGAINST in the repository for better relevance:

```sql
-- Current (LIKE)
WHERE title LIKE ? OR description LIKE ?

-- Upgraded (FULLTEXT)
WHERE MATCH(title, description) AGAINST (? IN BOOLEAN MODE)
```

No other file changes needed.

---

## File Responsibility Cheatsheet

| File | Responsibility | Change when |
|---|---|---|
| `docker-compose.yml` | Service wiring, env vars, ports | Adding a service or changing config |
| `database/schema.sql` | Table definitions, indexes | Schema changes |
| `database/seed.sql` | Sample data (210 products) | Adding/changing test products |
| `app.js` | Express bootstrap | Adding global middleware |
| `routes/search.js` | URL routing | Adding new endpoints |
| `controllers/searchController.js` | HTTP request/response | Changing API contract |
| `services/searchService.js` | Cache coordination, search flow | Changing cache logic |
| `services/cacheService.js` | Redis get/set | Changing cache key format or TTL |
| `repositories/productRepository.js` | MySQL queries | Changing search SQL, adding filters |
| `models/product.js` | Data shape mapping | Adding/removing product fields |
| `services/searchService.js` (frontend) | `searchProducts()` fetch wrapper | Changing API URL or params |
| `pages/SearchPage.jsx` | Page state machine | Adding new UI states |
| `components/SearchBar.jsx` | Search input UI | Adding filter inputs |
| `components/ProductCard.jsx` | Card display | Adding/removing displayed fields |
| `index.css` | All visual styles | Any styling changes |
