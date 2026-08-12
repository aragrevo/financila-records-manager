# Financial Records Manager

A personal finance management web application built with Astro, Tailwind CSS, and TypeScript. Features a "Fiscal Precision" design system with a professional fintech aesthetic.

## Features

- **Dashboard** — Summary cards with KPIs, asset allocation chart, fund progress bars, recent transactions
- **Accounts** — Bank account management with category filtering and net worth summary
- **Transaction History** — Full transaction list with search, filters by type/category/date, and spending analysis
- **Wealth Management** — Investment portfolio tracking, performance metrics, holdings table, and risk analysis

## Tech Stack

- [Astro](https://astro.build) 6.3.5 — Static site generator
- [Tailwind CSS](https://tailwindcss.com) 3.4.19 — Utility-first CSS
- TypeScript — Strict mode

## Quick Start

```bash
pnpm install
pnpm dev
```

Open `http://localhost:4321` in your browser.

## Expense Email Notifications

The independent `/expenses` module supports automatic email notifications for
created, edited, and deleted expenses. Configure Resend on the server with:

```text
RESEND_API_KEY=...
NOTIFICATION_FROM_EMAIL=Finance <notifications@your-domain.com>
```

Both variables are required. The sender domain must be verified in Resend (or
use `onboarding@resend.dev` for Resend's restricted testing mode).

Then open the expense configuration panel to set recipient email, currency, and
which events should send notifications. Expenses remain saved if email delivery
fails. The notification service is channel-based so WhatsApp, Telegram, or SMS
can be added later.

## Commands

| Command | Action |
|---------|--------|
| `pnpm dev` | Start dev server at `localhost:4321` |
| `pnpm build` | Build production site to `./dist/` |
| `pnpm preview` | Preview production build locally |

## Project Structure

```
src/
├── layouts/Layout.astro              # Base layout with sidebar navigation
├── pages/
│   ├── index.astro                   # Dashboard
│   ├── accounts.astro                # Account management
│   ├── history.astro                 # Transaction history
│   └── wealth.astro                  # Wealth management
├── components/
│   ├── ui/                           # Button, Card, Chip, Input
│   ├── dashboard/                    # SummaryCard, CategoryChart, ProgressBars
│   ├── accounts/                     # AccountTable
│   └── transactions/                 # TransactionTable
├── data/                             # Mock data (accounts, transactions, summary)
└── styles/global.css                 # Tailwind config + custom utilities
```

## Design System

**"Fiscal Precision"** — Corporate modern aesthetic for financial management:

- **Typography:** Inter (headings/body) + JetBrains Mono (financial figures)
- **Colors:** Slate/navy primary with functional accents:
  - Emergency (red) — Emergency fund
  - Investment (yellow) — Investment accounts
  - Retirement (green) — Retirement savings
  - Contingency (blue) — Contingency funds
- **Layout:** 12-column grid, compact data density, persistent sidebar

## Data

The app uses mock data defined in `src/data/`. To customize:

- `accounts.ts` — Bank accounts with types, balances, categories
- `transactions.ts` — Transaction history with categories and merchants
- `summary.ts` — Financial summaries and monthly trends

## License

MIT
