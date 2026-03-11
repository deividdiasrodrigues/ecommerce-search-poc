# 04 — Database & Infrastructure

---

## MySQL Schema

```
┌─────────────────────────────────────┐
│             categories              │
├─────────────────────────────────────┤
│ id          INT UNSIGNED PK AI      │
│ parent_id   INT UNSIGNED → self FK  │ ← hierarchical tree
│ name        VARCHAR(100) NOT NULL   │
│ created_at  TIMESTAMP               │
└──────────────────┬──────────────────┘
                   │ 1:N
┌──────────────────▼──────────────────┐
│               products              │
├─────────────────────────────────────┤
│ id                    INT UNSIGNED PK AI     │
│ navigation_id         VARCHAR(64) UNIQUE     │
│ title                 VARCHAR(255)           │
│ description           TEXT                  │
│ price                 DECIMAL(10,2)          │
│ seller                VARCHAR(100)           │
│ qty_sold_last_30_days INT UNSIGNED           │ ← used for sort relevance
│ image                 VARCHAR(512)           │
│ category_id           INT UNSIGNED → FK      │
│ rating_average        DECIMAL(3,2)           │
│ rating_count          INT UNSIGNED           │
│ created_at            TIMESTAMP              │
│ updated_at            TIMESTAMP (auto)       │
└─────────────────────────────────────┘
```

### Indexes

| Index | Type | Columns | Purpose |
|---|---|---|---|
| `idx_products_category` | BTREE | `category_id` | Category filter joins |
| `idx_products_title` | BTREE | `title` | LIKE prefix scans |
| `ft_products_search` | FULLTEXT | `title, description` | Future MATCH AGAINST |
| `idx_categories_parent` | BTREE | `parent_id` | Tree traversal |

### Seed Data

- **10 categories** across 3 trees: Electronics, Clothing, Home & Kitchen
- **210 products** with realistic titles, prices, ratings and placeholder images
- Ordered by `qty_sold_last_30_days` DESC in all search queries

---

## Redis Cache Strategy

```
Key format:   search:{normalized_term}
TTL:          300 seconds (5 minutes)
Encoding:     JSON.stringify / JSON.parse
Failure mode: Silent fallback to MySQL (non-fatal)
```

**Cache hit flow:**
```
searchService → cacheService.get("laptop")
                     → Redis GET search:laptop
                     → HIT: return parsed JSON (no DB query)
```

**Cache miss flow:**
```
searchService → cacheService.get("laptop")
                     → MISS: null returned
              → productRepository.searchByTerm("laptop")
              → cacheService.set("laptop", results)
                     → Redis SETEX search:laptop 300 <json>
              → return results
```

---

## Docker Compose Services

| Service | Image | Port | Health Check |
|---|---|---|---|
| `mysql` | mysql:8.0 | 3306 | `mysqladmin ping` |
| `redis` | redis:7-alpine | 6379 | `redis-cli ping` |
| `backend` | Custom (Node 20 Alpine) | 3001 | Depends on MySQL healthy |
| `frontend` | node:20-alpine (dev) | 5173 | Depends on backend |

### Startup Order

```
mysql (healthy) ──┐
                  ├──► backend ──► frontend
redis (healthy) ──┘
```

### Volumes

| Volume | Purpose |
|---|---|
| `mysql_data` | Persist MySQL data across restarts |

### SQL Init Files (auto-run by MySQL image)

```
01_schema.sql → creates tables + indexes
02_seed.sql   → inserts categories + 210 products
```

---

## Backend Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["node", "src/app.js"]
```

Frontend uses the plain `node:20-alpine` image with a volume mount (dev mode, hot reload enabled).
