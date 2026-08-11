# Fin-Tracker

A simple financial tracking tool for a home-based, made-to-order e-commerce business in India.

Built with **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**, and **Prisma + Postgres** (Neon).

## What it does

- **Products**: Add/edit/delete products with price, profit margin %, and units manufactured
- **Sales**: Log sales with auto-calculated profit (`revenue × margin%`), view running log
- **Marketing**: Track marketing spend by channel
- **Dashboard**: Auto-calculated KPIs including revenue, profit, and a simple business valuation

## Dashboard KPIs

| Metric | Formula |
|--------|---------|
| Total Valuation | Trailing 12-month profit × multiplier |
| Total Revenue | Sum of all sale revenue, all time |
| This Month's Sales | Revenue from sales dated in the current calendar month |
| This Month's Profit | Profit from sales dated in the current calendar month |
| Total Marketing Spend | Sum of all marketing spend entries |
| Per-product summary | Units sold, units remaining, revenue & profit per product |

## How the valuation multiplier works

The "Total Valuation" on the dashboard uses a **simple revenue multiple** methodology:

```
Valuation = Trailing 12-month profit × Multiplier
```

The default multiplier is **4×**, meaning if you made ₹1,00,000 profit in the last 12 months, your valuation shows as ₹4,00,000.

> **⚠️ This is a placeholder methodology, not a full DCF (Discounted Cash Flow) analysis.** It's labelled "Simple valuation (profit × multiple)" on the dashboard so there's no confusion. The multiplier is editable — you can change it as you refine your valuation approach.

## Setup

### Prerequisites

- Node.js 18+ and npm
- A Neon Postgres database (free tier works fine)

### Installation

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd fin-tracker

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Neon connection string and a password

# 4. Push the schema to your database
npx prisma db push

# 5. Generate the Prisma client
npx prisma generate

# 6. (Optional) Seed demo data
npx tsx prisma/seed.ts

# 7. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter your `APP_PASSWORD` to access the dashboard.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string (with `?sslmode=require`) |
| `APP_PASSWORD` | Password to access the app (simple gate, no user accounts) |

## Vercel Deployment

1. **Push to GitHub**: Push your repo to a GitHub repository
2. **Import in Vercel**: Go to [vercel.com](https://vercel.com), click "Import Project", select your repo
3. **Set environment variables** in Vercel project settings:
   - `DATABASE_URL` = your Neon connection string
   - `APP_PASSWORD` = your chosen password
4. **Deploy**: Vercel auto-detects Next.js and builds. Prisma generates during `next build` automatically if you add `"postinstall": "prisma generate"` to your package.json scripts
5. **Push schema to Neon**: Run `npx prisma db push` locally (it uses the same `DATABASE_URL`)
6. **Seed (optional)**: Run `npx tsx prisma/seed.ts` locally to add demo data

### Neon Database Setup

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from Dashboard → Connection Details
4. It should look like: `postgresql://user:pass@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

## Calculation Functions

All financial calculations are in `src/lib/calculations.ts` as pure, named, tested functions:

- `calculateProfit(revenue, profitMarginPct)` — `revenue × (margin / 100)`
- `getTotalRevenueTillDate(saleEntries)` — sum of all revenue
- `getMonthlySales(saleEntries, month, year)` — monthly revenue filter
- `getMonthlyProfit(saleEntries, month, year)` — monthly profit filter
- `getTrailingProfit(saleEntries, months)` — trailing N-month profit sum
- `getValuation(trailingProfit, multiplier)` — simple valuation
- `getProductSummary(product, saleEntries)` — per-product metrics

Each function has a unit test in `src/lib/calculations.test.ts` with hand-verifiable inputs.

## Tech Stack

- **Next.js 14** — App Router, Server Components, Server Actions
- **TypeScript** — type safety without runtime overhead
- **Tailwind CSS** — utility-first CSS
- **Prisma 5** — type-safe database ORM
- **Neon Postgres** — serverless Postgres
- **Simple password gate** — cookie-based, via Next.js middleware
