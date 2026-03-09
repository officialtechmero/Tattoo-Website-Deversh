# InkForge Frontend

Next.js (App Router) frontend for browsing tattoo references scraped by the backend.

## What is implemented

- Landing page (`/`) with hero, style filters, and trending design cards.
- Explore gallery (`/explore`) with search, pagination, modal preview, and downloads.
- Design details page (`/design/[id]`).
- SEO files: `robots.ts`, `sitemap.ts`, route-level metadata.
- Backend proxy API routes:
  - `GET /api/explore` (forwards to backend)
  - `GET /api/download-image` (downloads image by URL)

## Current routes

- `/`
- `/explore`
- `/design/[id]`
- `/_not-found`
- `/api/explore`
- `/api/download-image`
- `/robots.txt`
- `/sitemap.xml`

## Tech stack

- Next.js 15
- React 18 + TypeScript
- Tailwind CSS
- Radix UI primitives + shadcn-style components
- Vitest + Testing Library

## Environment variables

Create `.env.local` in `inkforge-frontend/`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:4000
```

Notes:
- `NEXT_PUBLIC_BACKEND_URL` is used by server/data helpers and API proxy routes.
- `NEXT_PUBLIC_SITE_URL` is used for canonical/sitemap metadata.

## Run locally

```bash
npm install
npm run dev
```

Default dev URL: `http://localhost:4000`

## Scripts

- `npm run dev` - Start dev server (Turbopack) on port 4000
- `npm run build` - Build production app
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode

## Data flow

- Home page loads designs from backend explore endpoint.
- Home fetch currently uses random ordering (`random=1`) to avoid same-category recent clustering.
- Explore page fetches via frontend proxy (`/api/explore`) and supports backend search/pagination.
