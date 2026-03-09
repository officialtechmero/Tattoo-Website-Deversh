# InkForge Backend

Fastify + TypeScript backend for scraping tattoo references from Pinterest, storing them in PostgreSQL, and serving explore/admin APIs.

## What is implemented

- Fastify server with health/readiness endpoints.
- PostgreSQL access via `pg` + Drizzle ORM.
- Scraper queue with BullMQ + Redis.
- Playwright Pinterest scraper worker.
- Image persistence flow:
  - scrape Pinterest image URLs
  - dedupe against existing rows
  - save local manifest + files
  - optional BunnyCDN upload service
- Explore API with search, pagination, and random ordering.
- Admin scraper init endpoint supporting single query, comma-separated query, and array input.

## API routes

Base server:
- `GET /` - basic status + uptime
- `GET /health` - liveness
- `GET /ready` - DB readiness check

Explore:
- `GET /api/explore`
  - Query params:
    - `page` (default `1`)
    - `limit` (default `30`, max `100`)
    - `search` (space-separated terms)
    - `withTotal` (`1` or `0`)
    - `random` (`1` for random order)

Admin:
- `GET /api/admin` - paginated admin image list
- `POST /api/admin/scrap` - enqueue scraping job(s)
  - Body:
    - `query`: string, comma-separated string, JSON array string, or string[]
    - `limit`: number (optional)
    - `scrolls`: number (optional)

## Tech stack

- Node.js + TypeScript
- Fastify
- PostgreSQL (`pg`)
- Drizzle ORM + Drizzle Kit
- BullMQ + Redis
- Playwright

## Project structure

```txt
src/
  config/
  controllers/
  db/
  queues/
  routes/
  services/
  session/
  workers/
  index.ts
```

## Environment variables

Create `.env` in `inkforge-backend/`:

```env
# Core
PORT=5000
HOST=0.0.0.0
FRONTEND_URL=http://localhost:4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inkforge
DB_SSL=false

# Redis (BullMQ)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Pinterest session helper (optional)
PINTEREST_EMAIL=
PINTEREST_PASSWORD=

# Bunny upload service (optional)
BUNNY_STORAGE_ZONE=
BUNNY_STORAGE_PASSWORD=
BUNNY_STORAGE_REGION=
BUNNY_PUBLIC_BASE_URL=
```

Notes:
- `DATABASE_URL` is required.
- Bunny upload loop only runs when Bunny env vars are provided.

## Run locally

1. Install dependencies

```bash
npm install
```

2. Start PostgreSQL and Redis (your preferred method).

3. Push schema

```bash
npm run db:push
```

4. (Optional) create Pinterest session file

```bash
npm run session:login
```

5. Start backend

```bash
npm run dev
```

Server default: `http://localhost:5000`

## Scripts

- `npm run dev` - Start API server in watch mode
- `npm run build` - Compile TypeScript
- `npm run start` - Run compiled server
- `npm run typecheck` - Type-check only
- `npm run session:login` - Save Pinterest login session (`pinterest-session.json`)
- `npm run scrap` - Watch queue file (legacy helper script)
- `npm run start:all` - Run `dev` and `scrap` together
- `npm run db:generate` - Generate Drizzle SQL
- `npm run db:push` - Push schema
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio

## Scraping pipeline summary

1. `POST /api/admin/scrap` enqueues one or more jobs.
2. Worker scrapes Pinterest, filters/normalizes image URLs, dedupes, and stores DB rows.
3. Worker writes local files + manifest in `downloads/`.
4. Bunny upload service polls `ready to upload` jobs and replaces `imageLink` with Bunny public URLs.
