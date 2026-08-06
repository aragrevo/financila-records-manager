# AGENTS.md

## Architecture

- Astro 6.3.5 server-rendered site with Tailwind CSS 3.4.19 and TypeScript
- Backend: Upstash Redis (serverless) via `@upstash/redis`
- Deployed on Vercel with `@astrojs/vercel` adapter
- Design system: "Fiscal Precision" (fintech aesthetic)
- UI language is English

## Package Manager

Always use **pnpm** (not npm or yarn).

## Running Locally

```bash
pnpm dev
```

Dev server runs at `http://localhost:4321`

Requires `.env` file with:
```
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
GEMINI_API_KEY=...
```

## Build

```bash
pnpm build
```

Output goes to `.vercel/output/` directory.

## Database

Upstash Redis is used for persistent storage. Data structure:
- Accounts stored as hashes (`account:{id}`) with index in `accounts:index`
- Transactions stored as hashes (`transaction:{id}`) with sorted sets for indexing by date, account, and category

## API Endpoints

- `GET /api/accounts` — List all accounts
- `POST /api/accounts` — Create account
- `GET /api/accounts/[id]` — Get account by ID
- `PUT /api/accounts/[id]` — Update account
- `DELETE /api/accounts/[id]` — Delete account
- `GET /api/transactions` — List transactions (supports `?accountId=`, `?categoryId=`, `?limit=`, `?offset=`)
- `POST /api/transactions` — Create transaction
- `GET /api/transactions/[id]` — Get transaction by ID
- `PUT /api/transactions/[id]` — Update transaction
- `DELETE /api/transactions/[id]` — Delete transaction
- `GET /api/ai/insights` — AI analysis of funds (Gemini, cached 24h in Redis; `?refresh=1` to force)
- `GET /api/ai/portfolio-insights` — AI analysis of stock portfolio (Gemini, cached 24h; `?refresh=1` to force)

## No Tooling

There is no test suite, linter, formatter, type checker, or CI pipeline. Changes are verified by running the app manually.

## Key Patterns

- All pages use `src/layouts/Layout.astro` as base
- Tailwind config extends with custom colors from "Fiscal Precision" design system
- Color classes use `on-surface`, `on-primary`, etc. (not `text-on-surface-variant`)
- Services in `src/services/` fetch data from Redis (not mock data)
- UI components in `src/components/ui/` (Button, Card, Chip, Input)
- Financial figures use `font-mono` class for tabular alignment

## File Structure

```
src/
├── layouts/Layout.astro              # Base layout with sidebar navigation
├── pages/
│   ├── index.astro                   # Dashboard (summary cards, charts)
│   ├── accounts.astro                # Account management table
│   ├── history.astro                 # Transaction history with filters
│   ├── wealth.astro                  # Wealth management & investments
│   └── api/                          # REST API endpoints
│       ├── accounts/
│       │   ├── index.ts              # GET/POST accounts
│       │   └── [id].ts              # GET/PUT/DELETE account
│       └── transactions/
│           ├── index.ts              # GET/POST transactions
│           └── [id].ts              # GET/PUT/DELETE transaction
├── components/
│   ├── ui/                           # Button, Card, Chip, Input
│   ├── dashboard/                    # SummaryCard, CategoryChart, ProgressBars
│   ├── accounts/                     # AccountTable
│   └── transactions/                 # TransactionTable
├── lib/
│   ├── db.ts                         # Redis client and key helpers
│   ├── types.ts                      # Shared TypeScript types
│   ├── queries.ts                    # Batched (pipeline) Redis read helpers
│   └── http.ts                       # JSON response helper for API routes
├── services/
│   ├── accounts.service.ts           # Account data access (Redis)
│   ├── transactions.service.ts       # Transaction data access (Redis)
│   ├── dashboard.service.ts          # Dashboard computed data
│   ├── summary.service.ts            # Wealth summary computed data
│   ├── billing.service.ts            # Billing records data access (Redis)
│   └── insights.service.ts           # AI insights (Gemini + Redis cache)
├── data/
│   └── dashboard.ts                  # Dashboard display data (hardcoded)
└── styles/
    └── global.css                    # Tailwind imports + custom utilities
```

## Design System Tokens

Colors defined in `tailwind.config.mjs`:
- `surface`, `surface-container-*` — backgrounds
- `on-surface`, `on-surface-variant` — text colors
- `primary`, `on-primary` — main brand
- `emergency`, `investment`, `retirement`, `contingency` — category colors

Typography: Inter (headings/body) + JetBrains Mono (financial figures)

## Quirks

- Tailwind v3 required (v4 breaks Astro integration)
- `@astrojs/tailwind` v5.x (not v6.x which requires Tailwind v4)
- No `text-on-surface-variant` class — use `text-on-surface-variant` directly from config
