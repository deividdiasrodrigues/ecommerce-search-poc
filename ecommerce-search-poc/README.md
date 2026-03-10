# Ecommerce Search POC

A minimal, production-quality proof of concept for validating ecommerce search strategies.

## Stack

| Layer     | Technology            |
|-----------|-----------------------|
| Frontend  | React + Vite          |
| Backend   | Node.js + Express     |
| Database  | MySQL 8               |
| Cache     | Redis 7               |

## Getting Started

```bash
docker compose up --build
```

| Service      | URL                       |
|--------------|---------------------------|
| Frontend     | http://localhost:5173      |
| Backend API  | http://localhost:3001      |
| Health Check | http://localhost:3001/health |

Try searching: `laptop`, `samsung`, `apple`, `nike`, `gaming`, `chair`, `wireless`

## Search API

```
GET /search?q=term
```

Returns a JSON array of matching products ordered by sales volume.

## Architecture

```
Search Request
     │
     ▼
Controller (input validation)
     │
     ▼
SearchService
     ├── Cache check (Redis)
     │        └── HIT → return cached result
     │
     └── MISS → ProductRepository (MySQL LIKE)
                      └── Cache result → return
```

## Project Structure

```
ecommerce-search-poc/
├── frontend/          # React + Vite SPA
├── backend/           # Express API
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── models/
│       └── routes/
├── database/          # schema.sql + seed.sql (210 products)
└── docker-compose.yml
```

## Reset

```bash
docker compose down -v && docker compose up --build
```
