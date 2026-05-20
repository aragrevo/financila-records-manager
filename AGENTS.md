# AGENTS.md

## Architecture

- Astro 6.3.5 static site with Tailwind CSS 3.4.19 and TypeScript
- No backend, no API routes — static HTML generation only
- Design system: "Fiscal Precision" (fintech aesthetic)
- UI language is English

## Package Manager

Always use **pnpm** (not npm or yarn).

## Running Locally

```bash
pnpm dev
```

Dev server runs at `http://localhost:4321`

## Build

```bash
pnpm build
```

Output goes to `dist/` directory.

## No Tooling

There is no test suite, linter, formatter, type checker, or CI pipeline. Changes are verified by running the app manually.

## Key Patterns

- All pages use `src/layouts/Layout.astro` as base
- Tailwind config extends with custom colors from "Fiscal Precision" design system
- Color classes use `on-surface`, `on-primary`, etc. (not `text-on-surface-variant`)
- Mock data lives in `src/data/` (accounts.ts, transactions.ts, summary.ts)
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
│   └── wealth.astro                  # Wealth management & investments
├── components/
│   ├── ui/                           # Button, Card, Chip, Input
│   ├── dashboard/                    # SummaryCard, CategoryChart, ProgressBars
│   ├── accounts/                     # AccountTable
│   └── transactions/                 # TransactionTable
├── data/
│   ├── accounts.ts                   # Mock account data
│   ├── transactions.ts               # Mock transaction data
│   └── summary.ts                    # Mock summary/financial data
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
