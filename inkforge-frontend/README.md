# InkForge Frontend

Frontend web app for InkForge AI, built with Next.js (App Router), TypeScript, Tailwind CSS, and Radix/shadcn-style UI components.

## Current Progress

The frontend is in a strong UI/UX prototype stage with multiple production-like pages and interactions.

- Marketing landing page with modular sections (hero, social proof, workflow, gallery, testimonials, pricing).
- Dedicated pages for:
  - `/generate`
  - `/explore`
  - `/stencil`
  - `/design/[id]`
  - `/dashboard`
  - `/pricing`
  - `/login`
  - `/signup`
- SEO metadata configured per route.
- `robots.ts` and `sitemap.ts` included.
- Rich reusable component library under `src/components/ui`.
- Local mock data model powering explore/design/dashboard experiences.
- Basic tests configured with Vitest + Testing Library.

### Feature Status (Current)

- Most page-level functionality is UI-driven and mock-data based.
- Generation and stencil flows simulate behavior locally (no backend/API integration yet).
- Auth screens are present as UI and are not yet connected to backend auth endpoints.

## Tech Stack

- Next.js 15 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Radix UI primitives + shadcn-style components
- Framer Motion
- Vitest + Testing Library

## Project Structure

```txt
src/
  app/
  views/
  components/
    layout/
    landing/
    ui/
  lib/
  hooks/
  assets/
  test/
```

## Environment Variables

Optional (`.env.local`):

```env
NEXT_PUBLIC_SITE_URL=http://localhost:4000
```

If omitted, the app defaults to `http://localhost:3000` for `siteUrl` metadata.

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Run development server

```bash
npm run dev
```

Default dev URL: `http://localhost:4000`

## Scripts

- `npm run dev` - Start Next.js dev server (Turbopack, port 4000)
- `npm run build` - Build production app
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode

## Routing Snapshot

- `/` - Landing page
- `/generate` - AI generation UI
- `/explore` - Gallery with filters/sorting/search
- `/stencil` - Image-to-stencil UI
- `/design/[id]` - Design detail page
- `/dashboard` - User design dashboard
- `/pricing` - Pricing + FAQs
- `/login` - Login UI
- `/signup` - Signup UI

## Notes

- The frontend is ready for API integration phase (auth, generation, gallery persistence).
- Current architecture already separates views, reusable UI, and data utilities for smoother backend wiring.