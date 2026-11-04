# RENA — Retrieval-Enhanced Network for Analytics

RENA is a business intelligence workspace for the **Olist Brazilian E-Commerce Public Dataset**. It combines an interactive dashboard with an AI assistant that turns questions in natural language into read-only SQL, runs them, and explains the result.

This repository contains the **frontend only**. It talks to a separate FastAPI backend (PostgreSQL, AI/RAG/MCP logic), which is not part of this project.

## Features

- **Landing page** (`/`): product overview with links into the app.
- **BI dashboard** (`/dashboard`): five KPI cards and eight charts, with the AI Assistant docked as a side panel.
  - Monthly Sales Trend, Order Status Distribution, Monthly Order Trend, Freight vs Product Sales
  - Top Product Categories, Top Sellers, Payment Method Analysis, Review Score Distribution
- **AI Assistant**: embedded panel and a full-page mode. Answers include an explanation, a business insight, a result table, and the generated SQL (syntax highlighted).
- **Query History**: questions from the current session, with status and time. Click one to reopen its answer.
- **New Conversation** and **suggested questions**.
- **Themes**: Light, Dark, and System, saved in `localStorage` and applied before first paint to avoid a flash.
- **Responsive**: desktop, tablet, and mobile. On narrower screens the assistant opens as a slide-over from the "Ask AI" button.

## Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · Recharts · Geist font. No UI component library.

## Requirements

- Node.js (a version supported by Next.js 16) and npm
- The RENA backend running and reachable. By default the frontend expects it at `http://127.0.0.1:8000`.

## Getting started

```bash
npm install
```

Create `.env.local` in the project root if your backend is not at the default address:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Then start the development server:

```bash
npm run dev
```

Open <http://localhost:3001>.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server on port 3001 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on port 3001 |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check |

## Backend integration

The API client lives in `app/lib/api.ts`, with request and response types in `app/lib/types.ts`. The frontend uses three endpoints:

| Endpoint | Used for |
| --- | --- |
| `/health` | Connection status badge |
| `/dashboard/overview` | KPI cards and chart data |
| `/ask` | AI Assistant questions |

If the backend is offline, the status badge shows it and the dashboard offers a retry.

## Project structure

```
app/
  page.tsx                 Landing page route (/)
  dashboard/page.tsx       Dashboard route (/dashboard)
  layout.tsx               Root layout, metadata, no-flash theme script
  globals.css              Design tokens (Light and Dark) and Tailwind setup
  icon.svg, favicon.ico,
  apple-icon.png,
  opengraph-image.png,
  manifest.ts              App icons and metadata
  components/
    landing.tsx            Marketing page
    dashboard.tsx          Workspace shell and state (view, chat, history)
    data-overview.tsx      KPI strip and charts
    sidebar.tsx, topbar.tsx
    chat-area.tsx, chat-input.tsx, chat-message.tsx, ai-response.tsx
    markdown.tsx, query-table.tsx, sql-code.tsx
    query-history.tsx, suggestions.tsx
    theme-switcher.tsx, status-badge.tsx, icons.tsx
  lib/
    api.ts, types.ts, format.ts, use-health.ts
    theme.ts               Theme hook (localStorage + system preference)
    suggested-questions.ts
public/brand/              Logo and icon assets
```

## Design system

All colors come from CSS variables defined in `app/globals.css` and exposed to Tailwind as tokens (`bg-panel`, `text-ink`, `border-border`, `bg-primary`, and so on). Light mode uses Sky Blue (`#0EA5E9`) with Deep Navy (`#0F172A`). Dark mode uses its own palette, with a lighter primary (`#38BDF8`) and layered surfaces. Chart series use `--chart-1` to `--chart-8`, which have separate Light and Dark values.

To change the look of the app, edit the variables in `:root` and `.dark` rather than hard-coding colors in components.

## Brand assets

In `public/brand/`:

| File | Use |
| --- | --- |
| `rena-mark.svg` | Square logo mark |
| `rena-logo.svg`, `rena-logo-dark.svg` | Horizontal logo for light and dark backgrounds |
| `rena-icon-192.png`, `rena-icon-512.png` | PWA icons |
| `og-image.png` | Social sharing image (1200×630) |

The wordmark in the logo SVGs is live text in the Geist/Inter/system font stack. Convert it to outlines in a design tool before using it in print or external materials.

## Notes

- Query History is kept in memory for the current session. It resets on reload or when you start a new conversation.
- `AGENTS.md` notes that this Next.js version differs from older releases. Check the Next.js documentation before relying on older patterns.
