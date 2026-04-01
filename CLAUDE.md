# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Creative CV / portfolio site for Francesco Urban (Francesco Romito) — an interactive, narrative-driven developer portfolio combined with a B2B digital services platform. The site is in Italian (`lang="it"`).

Two main areas:
- **CV section** (`src/app/(cv)/`) — scroll-driven storytelling experience ("Da Zero a Developer") with heavy animations, smooth scroll, and code editor mockups
- **Services platform** (`src/app/services/`) — service pages, AI preview generator, quote system, user dashboard, admin panel under the brand "Edizioni Duepuntozero"

## Commands

```bash
npm run dev          # Dev server with Turbopack
npm run build        # Production build with Turbopack
npm start            # Start production server
npm run lint         # ESLint (next/core-web-vitals)
```

## Tech Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/postcss`)
- **GSAP** + **ScrollTrigger** for scroll-driven animations
- **Lenis** for smooth scrolling (wrapped in `SmoothScroll` component)
- **Three.js** + React Three Fiber + Drei (installed, partially used)
- **Framer Motion** (installed, minimal usage)
- **Supabase** — auth (email + Google OAuth), PostgreSQL, Storage
- **Google Gemini** (`@google/genai`) — AI image generation for previews

## Architecture

### Route Structure
- `src/app/(cv)/` — CV route group with its own layout (Space Grotesk + DM Sans fonts, SmoothScroll wrapper). JSX files (not TSX).
- `src/app/services/` — Services platform with separate layout (Geist + Instrument Serif fonts). Contains nested routes:
  - `services/(auth)/` — login/register
  - `services/admin/` — admin panel (protected via `requireAdmin()` in layout)
  - `services/dashboard/` — user dashboard (auth-gated in layout)
  - `services/api/auth/callback/` — Supabase OAuth callback
  - `services/mobile-app/`, `shop-saas/`, `siti-web/`, `web-app/` — service detail pages

### Key Directories
- `src/app/lib/supabase/` — three client flavors: `client.ts` (browser), `server.ts` (server components/actions), `service.ts` (service role, no cookies)
- `src/app/lib/auth/admin.ts` — `requireAdmin()` and `isAdmin()` helpers
- `src/app/lib/gemini.ts` — Gemini API client with custom error classes and retry logic
- `src/app/actions/` — server actions for admin ops, quotes, previews, rate limiting
- `src/app/data/` — service packages/pricing config, AI prompt engineering, site config
- `src/app/components/` — shared components (Hero, Navbar, Footer, AI wizard, etc.)

### Auth Pattern
No middleware.ts — auth is enforced at the layout level via server-side redirects. Admin access checks profile role from Supabase `profiles` table.

### Database Types
Supabase types are defined in `src/app/lib/supabase/types.ts`. Tables: `profiles`, `quotes`, `previews`, `rate_limits`.

## Design System — "Developer's Night"

Dark-mode only. CSS custom properties defined in `src/app/globals.css`:
- Backgrounds: `--bg-primary` (#0a0a0f) through `--bg-surface` (#24243a)
- Accents: indigo (`--accent-primary`), violet (`--accent-secondary`), cyan (`--accent-tertiary`)
- Glow effects via `--glow-*` variables
- Utility classes: `.gradient-text`, `.glow-primary`, `.glow-text-*`, `.gpu-accelerated`
- Never hardcode colors — always use CSS variables

### Typography
- CV section: Space Grotesk (headings) + DM Sans (body)
- Services section: Geist + Instrument Serif

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

## Important Patterns

- **GSAP cleanup**: Always use `gsap.context()` for automatic cleanup in React components
- **Mobile detection**: Use `isMobile()` from `src/utils/detectDevice.js` — parallax and typing animations are disabled on mobile
- **Syntax highlighting**: Use the `Light` build of react-syntax-highlighter with manual language imports (not the full Prism build)
- **Rate limiting**: Dual strategy — Supabase RPC with in-memory Map fallback
- **AI previews**: Stored in Supabase Storage with signed URLs (1hr expiry), metadata in `previews` table

## Content

`copy.txt` at project root contains the narrative copy for all 10 CV sections. Section 1 ("La Prima Riga") is implemented; sections 2-10 are planned.
