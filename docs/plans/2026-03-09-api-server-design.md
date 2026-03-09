# API Server Design — Card Data Decoupling

**Date:** 2026-03-09
**Status:** Approved
**Scope:** Phase 1 — Move card content to a standalone Hono API. User accounts deferred.

---

## Motivation

Two drivers:

1. **Decouple content from the client.** Card data currently lives as TypeScript modules inside the Next.js repo. Moving it to a dedicated API lets any client (web, mobile, CLI) consume the same data without sharing a codebase.
2. **Lay groundwork for user accounts.** A proper backend is required for auth. This phase establishes that service without building auth yet — keeping scope small and each phase shippable.

---

## Architecture

Two services, two repositories, same VPS:

| Service | Repo | Stack | Role |
|---------|------|-------|------|
| `purolingua` | existing | Next.js 15, TypeScript, Tailwind | Frontend, static export |
| `purolingua-api` | new | Hono, Node, TypeScript | Card data API |

The Next.js app remains a **static export** for this phase. Card data is fetched from the Hono API at **build time** only — cards are baked into the static HTML output. The deployed frontend has zero runtime dependency on the API server.

This means the API serves two audiences from day one:
- The **Next.js build pipeline** (build-time fetch)
- **Future clients** (mobile, other frontends) at runtime

Auth will require dropping `output: 'export'` — that change is deferred to the auth phase.

---

## API Design

Base URL: `https://api.purolingua.com`

### Endpoints

```
GET /decks/:lang
GET /decks/:lang/:deckId
```

Both endpoints are read-only. No authentication required in this phase.

### Response Shapes

**`GET /decks/it`**
```json
{
  "decks": [
    {
      "id": "restaurant",
      "cards": [
        { "front": "il conto", "back": "the bill", "level": "A1" }
      ]
    }
  ]
}
```

**`GET /decks/it/restaurant`**
```json
{
  "id": "restaurant",
  "cards": [
    { "front": "il conto", "back": "the bill", "level": "A1" }
  ]
}
```

### Design Constraints

- `:lang` values: `it`, `es` — matches existing Next.js locale codes
- `:deckId` values match existing deck IDs exactly — no renames
- Card array order is strictly preserved — positional index SRS contract must not break
- `404` for unknown lang or deckId
- `400` for malformed requests
- CORS open (`*`) for now — tightened when auth is introduced
- No pagination — deck sizes are small and fixed

---

## Data Flow

### Build time (Next.js → Hono)

```
next build
  → generateStaticParams fetches GET /decks/it + GET /decks/es
  → page server components fetch GET /decks/:lang/:deckId per deck
  → card data baked into static HTML/JSON in out/
  → deployed frontend has no runtime API dependency
```

### Runtime (future clients → Hono)

```
mobile app / future web client
  → GET /decks/:lang          (deck browser)
  → GET /decks/:lang/:deckId  (study session)
```

### Environment Configuration

```bash
# purolingua/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000

# purolingua production build
NEXT_PUBLIC_API_URL=https://api.purolingua.com
```

`NEXT_PUBLIC_` prefix is intentional — future client-side fetches (post auth phase) will need it available in the browser without env changes.

---

## purolingua-api Repository Structure

```
purolingua-api/
  src/
    data/
      it/                  (Italian card data, moved from purolingua)
      es/                  (Spanish card data, moved from purolingua)
      index.ts             (aggregates all decks by lang)
    routes/
      decks.ts             (route handlers for /decks/:lang and /decks/:lang/:deckId)
    index.ts               (Hono app, binds routes, starts server)
  package.json
  tsconfig.json
```

---

## Changes to purolingua

- `src/data/` card modules removed (data moves to `purolingua-api`)
- `generateStaticParams` fetches language list from API instead of a hardcoded array
- Page server components replace direct data imports with `fetch(API_URL + '/decks/...')`
- All hooks, SRS logic, and UI components are untouched

---

## What This Phase Does Not Include

- Authentication or user accounts
- Any write endpoints (POST/PUT/DELETE)
- A database (card data is served from TypeScript files in the API repo)
- Dropping `output: 'export'` from Next.js
- Dynamic server-side rendering

---

## Migration Path to Auth Phase

When user accounts are added:

1. Add Postgres + Drizzle to `purolingua-api` for user and progress tables
2. Add auth endpoints (register, login, token refresh)
3. Drop `output: 'export'` from `next.config.ts` — Next.js becomes server-rendered
4. Replace localStorage SRS state with API-backed progress endpoints
5. CORS policy tightened to `purolingua.com` only
