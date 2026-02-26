# InkForge Backend

Backend API service for InkForge AI, built with Fastify, TypeScript, PostgreSQL, and Drizzle ORM.

## Current Progress

The backend is in an early foundation stage with server, database, and project structure in place.

- Fastify server bootstrapped with logging, startup checks, and graceful shutdown.
- PostgreSQL connection configured through `pg` pool + Drizzle ORM.
- Drizzle schema defined for core domain models:
  - `users`
  - `plans`
  - `subscriptions`
  - `designs`
  - `favorites`
  - `downloads`
  - `categories`
  - `designCategories`
- User routes scaffolded under `/api/users`.
- Docker + Compose setup available for DB-only and app+DB runs.

### API Status (Current)

- `GET /` -> implemented (service status + uptime)
- `GET /api/users/` -> implemented (fetches users)
- `POST /api/users/signup` -> scaffolded, logic pending
- `POST /api/users/signin` -> scaffolded, logic pending
- `PUT /api/users/verify-account` -> scaffolded, logic pending
- `DELETE /api/users/delete-account` -> scaffolded, logic pending

## Tech Stack

- Node.js + TypeScript
- Fastify
- PostgreSQL (`pg`)
- Drizzle ORM + Drizzle Kit
- Docker / Docker Compose

## Project Structure

```txt
src/
  controllers/
  db/
    client.ts
    schema.ts
  routes/
  index.ts
```

## Environment Variables

Create `.env` in `inkforge-backend/`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inkforge
PORT=3000
HOST=0.0.0.0
```

## Getting Started (Local)

1. Install dependencies

```bash
npm install
```

2. Start PostgreSQL

```bash
docker compose -f docker-compose.db.yml up -d
```

3. Apply schema (recommended)

```bash
npm run db:push
```

4. Run backend in development mode

```bash
npm run dev
```

Server runs on `http://localhost:3000` by default.

## Scripts

- `npm run dev` - Run backend with watch mode
- `npm run build` - Compile TypeScript
- `npm run start` - Run compiled server
- `npm run typecheck` - Type-check without emit
- `npm run db:generate` - Generate drizzle SQL files
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio

## Docker

Run full backend stack (app + database):

```bash
docker compose up --build
```

- App: `http://localhost:3001`
- Postgres: `localhost:5432`

## Notes

- `docker/postgres/init.sql` currently seeds a basic `users` table for initial testing.
- Core auth/business logic is intentionally scaffolded and pending implementation.