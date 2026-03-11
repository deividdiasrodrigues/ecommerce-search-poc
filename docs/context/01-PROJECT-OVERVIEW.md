# 01 — Project Overview

> **Purpose:** Ecommerce Search POC — validate search strategies on a realistic product catalog using MySQL and Redis.

---

## Goals

| Goal | Description |
|---|---|
| **Primary** | Validate MySQL LIKE search as baseline |
| **Caching** | Redis to reduce DB load on repeated queries |
| **UX** | Responsive product gallery with instant feedback |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│              React SPA (Vite, port 5173)                │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP GET /search?q=term
┌───────────────────────▼─────────────────────────────────┐
│               Express API (port 3001)                   │
│                                                         │
│  Route → Controller → SearchService                     │
│                              │                          │
│              ┌───────────────┴───────────┐              │
│              ▼                           ▼              │
│           Redis                        MySQL            │
│          (cache)                      (search)          │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version | Status |
|---|---|---|---|
| Frontend | React + Vite | React 18, Vite 5 | ✅ Active |
| Backend | Node.js + Express | Node 20, Express 4 | ✅ Active |
| Database | MySQL | 8.0 | ✅ Active |
| Cache | Redis | 7 Alpine | ✅ Active |
| Container | Docker Compose | v3.9 | ✅ Active |

---

## Running Locally

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| Health Check | http://localhost:3001/health |

---

## Key Design Principles

1. **Minimal complexity** — no ORM, no heavy frameworks, no unnecessary abstraction
2. **Non-fatal cache** — Redis failure never breaks search, always falls back to MySQL
3. **Layered backend** — each layer has exactly one responsibility
4. **Schema-first DB** — pure SQL, no migrations framework needed for POC


---

## V2 Roadmap (PRD)

O PRD completo está em `docs/PRD-v2.md`. Resumo dos pilares:

### Processamento da Query
| Camada | O que faz |
|---|---|
| **Limpeza** | Remove stop words, adjetivos subjetivos, normaliza para minúsculo e sem acentos |
| **Flexionamento** | Plural/singular e variações de gênero tratados por radical |
| **Sinônimos** | Dicionário associativo (ex: `geladeira = refrigerador = freezer`) |

### Ranqueamento (ordem de prioridade)
1. Disponibilidade em estoque
2. Match no título do produto
3. Categoria relevante
4. Popularidade (qty_sold_last_30_days)

### UX Features
- **Autocomplete** a partir de 3 caracteres
- **Did you mean?** via Levenshtein Distance para queries sem resultado
- **Fallback** com vitrine de produtos mais buscados (sem página em branco)

### Requisitos Não Funcionais
- Latência < 200ms
- Log de queries com zero resultados (para curadoria quinzenal de sinônimos)
- Escalabilidade para múltiplas queries simultâneas
