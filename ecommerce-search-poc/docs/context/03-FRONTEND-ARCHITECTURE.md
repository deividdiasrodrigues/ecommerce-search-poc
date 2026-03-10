# 03 — Frontend Architecture

> **Entry point:** `frontend/src/main.jsx`
> **Port:** 5173
> **Framework:** React 18 + Vite 5

---

## Folder Structure

```
frontend/src/
├── main.jsx                ← React root mount
├── App.jsx                 ← Root component (renders SearchPage)
├── index.css               ← All styles (no CSS framework)
├── services/
│   └── searchService.js    ← fetch() wrapper for GET /search
├── components/
│   ├── SearchBar.jsx        ← Controlled input + submit button
│   └── ProductCard.jsx     ← Single product display card
└── pages/
    └── SearchPage.jsx      ← Page state machine, composes all UI
```

---

## Component Tree

```
App
└── SearchPage                  ← owns all state (status, products, error)
    ├── SearchBar               ← controlled form, calls onSearch prop
    └── [results section]
        ├── <p> status/meta     ← idle / loading / error / count
        └── <section.product-grid>
            └── ProductCard[]   ← pure display, receives product prop
```

---

## State Machine (SearchPage)

```
       ┌──────────────────────────────┐
       │           IDLE               │ ← initial state
       └─────────────┬────────────────┘
                     │ user submits search
                     ▼
       ┌──────────────────────────────┐
       │          LOADING             │ ← "Searching…" shown
       └──────┬───────────────┬───────┘
              │ success        │ error
              ▼                ▼
       ┌────────────┐  ┌──────────────┐
       │  SUCCESS   │  │    ERROR     │
       │ show grid  │  │ show message │
       └────────────┘  └──────────────┘
              │ new search submitted
              └──────────────────────► LOADING
```

---

## Responsive Grid

```css
/* Desktop  (>1024px) */ grid-template-columns: repeat(4, 1fr);
/* Tablet  (≤1024px)  */ grid-template-columns: repeat(2, 1fr);
/* Mobile  (≤560px)   */ grid-template-columns: 1fr;
```

All breakpoints live in `index.css` under `.product-grid`.

---

## Data Flow

```
User types + clicks Search
        │
        ▼
SearchBar.onSubmit(e)
        │ calls onSearch(term) prop
        ▼
SearchPage.handleSearch(query)
        │ setStatus(LOADING)
        │
        ▼
searchService.searchProducts(query)
        │ fetch(`${VITE_API_URL}/search?q=${query}`)
        │
        ├── ok  → setProducts(results), setStatus(SUCCESS)
        └── err → setError(msg),     setStatus(ERROR)
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | http://localhost:3001 | Backend base URL |

Set in `docker-compose.yml` under the `frontend` service environment.

---

## Styling Approach

- **Plain CSS** in a single `index.css` — zero dependencies
- **CSS custom properties** not needed at POC scale
- **BEM-ish naming** for components: `.product-card__title`, `.product-card__body`
- **No CSS-in-JS**, no Tailwind — easy to read and override
- Images use `loading="lazy"` for performance
- Cards use CSS `transition` for hover effects (no JS)

---

## ProductCard Fields Displayed

| Field | Display |
|---|---|
| `image` | Full-width image, `object-fit: cover` |
| `title` | 2-line clamp with ellipsis |
| `navigation_id` | Monospace subtitle (`ID: PROD-001`) |
| `price` | Formatted with `Intl.NumberFormat` (USD) |
| `rating_average` | ★ icon + decimal |
| `rating_count` | Count in parentheses |
