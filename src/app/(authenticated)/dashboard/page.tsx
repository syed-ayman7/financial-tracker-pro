export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';
import {
  getTotalRevenueTillDate,
  getMonthlySales,
  getMonthlyProfit,
  getTrailingProfit,
  getValuation,
  getProductSummary,
  SaleEntryForCalc,
} from '@/lib/calculations';
import { updateMultiplier } from '@/app/actions/valuation-actions';

/** Format a number as Indian Rupees */
function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function DashboardPage() {
  let sales: SaleEntryForCalc[] = [];
  let products: any[] = [];
  let marketingEntries: any[] = [];
  let valuationSetting: any = null;
  let dbError = false;

  try {
    const results = await Promise.all([
      prisma.saleEntry.findMany(),
      prisma.product.findMany({ include: { sales: true } }),
      prisma.marketingSpend.findMany(),
      prisma.valuationSetting.findFirst(),
    ]);
    sales = results[0];
    products = results[1];
    marketingEntries = results[2];
    valuationSetting = results[3];
  } catch (error) {
    console.error('Database connection error on Dashboard:', error);
    dbError = true;
  }

  // Current month/year for "This Month" calculations
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentYear = now.getFullYear();

  // KPI calculations using our named functions from calculations.ts
  const totalRevenue = getTotalRevenueTillDate(sales);
  const thisMonthSales = getMonthlySales(sales, currentMonth, currentYear);
  const thisMonthProfit = getMonthlyProfit(sales, currentMonth, currentYear);
  const trailingProfit = getTrailingProfit(sales, 12, now);
  const multiplier = valuationSetting?.multiplier ?? 4;
  const totalValuation = getValuation(trailingProfit, multiplier);
  const totalMarketingSpend = marketingEntries.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📊 Dashboard</h1>

      {dbError && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-5 mb-8 flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-semibold text-amber-400 text-base">
            <span>⚡ Database Connection Pending</span>
          </div>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            The application is live, but your Neon Postgres database connection string is not yet configured on Vercel. 
            Please add your <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300">DATABASE_URL</code> in Vercel Settings → Environment Variables.
          </p>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Total Valuation */}
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30">
          <p className="text-sm text-[var(--text-secondary)] mb-1">
            Total Valuation
          </p>
          <p className="text-3xl font-bold text-white mb-2">
            {formatINR(totalValuation)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            Simple valuation (profit × multiple) — not a full DCF
          </p>
          {/* Inline edit for multiplier */}
          <form action={async (formData: FormData) => {
            'use server';
            const newMultiplier = parseFloat(formData.get('multiplier') as string);
            if (!isNaN(newMultiplier) && newMultiplier > 0) {
              await updateMultiplier(newMultiplier);
            }
          }} className="flex items-center gap-2">
            <label className="text-xs text-[var(--text-secondary)]">Multiplier:</label>
            <input
              type="number"
              name="multiplier"
              defaultValue={multiplier}
              step="0.1"
              min="0.1"
              className="w-20 text-xs text-center"
            />
            <button
              type="submit"
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded transition-colors"
            >
              Update
            </button>
          </form>
        </div>

        {/* Total Revenue */}
        <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)] mb-1">
            Total Revenue Till Date
          </p>
          <p className="text-3xl font-bold text-[var(--success)]">
            {formatINR(totalRevenue)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Sum of all sale entries, all time
          </p>
        </div>

        {/* This Month's Sales */}
        <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)] mb-1">
            This Month&apos;s Sales
          </p>
          <p className="text-3xl font-bold text-white">
            {formatINR(thisMonthSales)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* This Month's Profit */}
        <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)] mb-1">
            This Month&apos;s Profit
          </p>
          <p className="text-3xl font-bold text-[var(--warning)]">
            {formatINR(thisMonthProfit)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Revenue × product margin %
          </p>
        </div>

        {/* Total Marketing Spend */}
        <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)] mb-1">
            Total Marketing Spend
          </p>
          <p className="text-3xl font-bold text-red-400">
            {formatINR(totalMarketingSpend)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            All channels, all time
          </p>
        </div>

        {/* Trailing 12m Profit (shown for reference) */}
        <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)] mb-1">
            Trailing 12-Month Profit
          </p>
          <p className="text-3xl font-bold text-emerald-400">
            {formatINR(trailingProfit)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Used for valuation calculation
          </p>
        </div>
      </div>

      {/* ── Per-Product Summaries ── */}
      <h2 className="text-xl font-semibold mb-4">Product Performance</h2>
      {products.length === 0 ? (
        <p className="text-[var(--text-muted)] text-center py-12">
          No products yet. <a href="/products" className="text-[var(--accent)] hover:underline">Add products</a> to see performance data.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const summary = getProductSummary(product, product.sales);
            return (
              <div
                key={product.id}
                className="bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border)] hover:border-[var(--accent)] transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  {product.name}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Units Sold</span>
                    <span className="font-medium">{summary.unitsSold}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Units Remaining</span>
                    <span className={`font-medium ${summary.unitsRemaining <= 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                      {summary.unitsRemaining}
                    </span>
                  </div>
                  <div className="border-t border-[var(--border)] pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Revenue</span>
                      <span className="font-medium text-[var(--success)]">
                        {formatINR(summary.revenueGenerated)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Profit</span>
                    <span className="font-medium text-[var(--warning)]">
                      {formatINR(summary.profitGenerated)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-[var(--text-muted)]">
                    <span>Margin</span>
                    <span>{product.profitMarginPct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
