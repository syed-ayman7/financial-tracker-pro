export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';
import { createSale, updateSale, deleteSale } from '@/app/actions/sale-actions';

/** Format a number as Indian Rupees */
function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Convert date to yyyy-mm-dd for HTML date input defaultValue */
function toInputDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default async function SalesPage() {
  const [products, sales] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
    prisma.saleEntry.findMany({
      include: { product: true },
      orderBy: { date: 'desc' },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">💰 Sales</h1>

      {/* ── Log a Sale Form ── */}
      <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border)] mb-8">
        <h2 className="text-lg font-semibold mb-4">Log a Sale</h2>
        {products.length === 0 ? (
          <p className="text-[var(--text-muted)]">
            No products exist yet.{' '}
            <a href="/products" className="text-[var(--accent)] hover:underline">
              Add a product
            </a>{' '}
            first.
          </p>
        ) : (
          <form action={createSale} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Product</label>
              <select name="productId" required>
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.profitMarginPct}% margin)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Date</label>
              <input type="date" name="date" required defaultValue={toInputDate(new Date())} />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Quantity Sold</label>
              <input type="number" name="quantitySold" required min="1" placeholder="1" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Revenue Received (₹)</label>
              <input type="number" name="revenueReceived" required step="0.01" min="0" placeholder="500" />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <button
                type="submit"
                className="bg-[var(--success)] hover:bg-green-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200"
              >
                + Log Sale
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Sales Log ── */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">Sales Log</h2>
          <p className="text-sm text-[var(--text-muted)]">{sales.length} entries, most recent first</p>
        </div>
        {sales.length === 0 ? (
          <p className="text-[var(--text-muted)] text-center py-12">No sales logged yet.</p>
        ) : (
          <div className="space-y-0">
            {/* Table header */}
            <div className="grid grid-cols-[120px_1fr_80px_120px_120px_140px] gap-2 px-4 py-3 text-xs text-[var(--text-muted)] border-b border-[var(--border)] font-medium">
              <span>Date</span>
              <span>Product</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Revenue</span>
              <span className="text-right">Profit</span>
              <span className="text-center">Actions</span>
            </div>
            {/* Each sale as its own form */}
            {sales.map((sale) => (
              <form
                key={sale.id}
                action={updateSale.bind(null, sale.id)}
                className="grid grid-cols-[120px_1fr_80px_120px_120px_140px] gap-2 px-4 py-3 items-center border-b border-[var(--border)] hover:bg-[var(--bg-input)]/30 transition-colors"
              >
                <input type="hidden" name="productId" value={sale.productId} />
                <input
                  type="date"
                  name="date"
                  defaultValue={toInputDate(sale.date)}
                  className="text-xs"
                />
                <span className="text-sm text-[var(--text-secondary)] truncate">
                  {sale.product.name}
                </span>
                <input
                  type="number"
                  name="quantitySold"
                  defaultValue={sale.quantitySold}
                  min="1"
                  className="text-xs text-right"
                />
                <input
                  type="number"
                  name="revenueReceived"
                  defaultValue={sale.revenueReceived}
                  step="0.01"
                  min="0"
                  className="text-xs text-right"
                />
                <span className="text-sm text-right text-[var(--warning)]">
                  {formatINR(sale.profit)}
                </span>
                <div className="flex justify-center gap-2">
                  <button
                    type="submit"
                    className="text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white py-1 px-3 rounded transition-colors"
                  >
                    Save
                  </button>
                  <button
                    formAction={deleteSale.bind(null, sale.id)}
                    className="text-xs bg-[var(--danger)] hover:bg-[var(--danger-hover)] text-white py-1 px-3 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </form>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
