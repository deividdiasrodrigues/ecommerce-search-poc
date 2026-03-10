# 02 — Backend Architecture

> **Entry point:** `backend/src/app.js`
> **Port:** 3001
> **Runtime:** Node.js 20 + Express 4

---

## Folder Structure

```
backend/src/
├── app.js                  ← Express bootstrap, middleware, error handler
├── config/
│   ├── db.js               ← MySQL connection pool (mysql2/promise)
│   └── redis.js            ← Redis client (ioredis, lazy connect)
├── routes/
│   └── search.js           ← GET /search route definition
├── controllers/
│   └── searchController.js ← HTTP input/output, delegates to service
├── services/
│   ├── searchService.js    ← Business logic + cache coordination
│   └── cacheService.js     ← Redis get/set abstraction (TTL: 5 min)
├── repositories/
│   └── productRepository.js← MySQL queries only, returns mapped rows
└── models/
    └── product.js          ← toProduct() row mapper, single source of truth
```

---

## Request Lifecycle

```
GET /search?q=laptop
       │
       ▼
  routes/search.js
       │
       ▼
  searchController.js
  ├── Validates: q must be present and non-empty
  └── Calls searchService.search(q)
            │
            ▼
      searchService.js
      ├── Normalizes term (trim + lowercase)
      ├── cacheService.get(term)
      │       ├── HIT  → return cached JSON array
      │       └── MISS → continue
      │
      ├── productRepository.searchByTerm(term)
      │       ├── LIKE on title + description
      │       ├── JOIN categories
      │       └── ORDER BY qty_sold_last_30_days DESC
      │
      ├── cacheService.set(term, results)  ← stores for 5 min
      └── return results
            │
            ▼
  searchController.js
  └── res.json(results)
```

---

## API Reference

### `GET /search?q={term}`

**Query params:**

| Param | Type | Required | Description |
|---|---|---|---|
| `q` | string | ✅ | Search term |

**Success response `200`:**
```json
[
  {
    "id": 31,
    "navigation_id": "PROD-031",
    "title": "MacBook Pro 16 M3 Max",
    "description": "Apple laptop with M3 Max chip...",
    "price": 3499.99,
    "seller": "Apple Store",
    "qty_sold_last_30_days": 80,
    "image": "https://placehold.co/400x400?text=MacBook+Pro+16",
    "category_id": 3,
    "category_name": "Laptops",
    "rating_average": 4.92,
    "rating_count": 640
  }
]
```

**Error response `400`:**
```json
{ "error": "Query parameter \"q\" is required." }
```

### `GET /health`
```json
{ "status": "ok" }
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | 3001 | Express port |
| `DB_HOST` | localhost | MySQL host |
| `DB_PORT` | 3306 | MySQL port |
| `DB_USER` | app | MySQL user |
| `DB_PASSWORD` | app_password | MySQL password |
| `DB_NAME` | ecommerce | MySQL database |
| `REDIS_HOST` | localhost | Redis host |
| `REDIS_PORT` | 6379 | Redis port |

---

## Key Implementation Notes

- **MySQL pool** uses `waitForConnections: true`, limit 10 — safe for concurrent requests
- **Redis** uses `lazyConnect: true` — won't crash on startup if Redis is slow
- **Cache failures** are silently swallowed — DB is always the fallback
- **LIMIT** is interpolated as a sanitized integer (not a placeholder) to avoid mysql2 prepared statement issues
- **SQL** uses parameterized queries (`?` placeholders) for user input — SQL injection safe
- **Error handler** in `app.js` catches all unhandled errors and returns `500`
