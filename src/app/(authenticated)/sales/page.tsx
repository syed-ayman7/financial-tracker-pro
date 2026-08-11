import { prisma } from '@/lib/db';
import { createSale, updateSale, deleteSale } from '@/app/actions/sale-actions';

/** Format a number as Indian Rupees */
function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Format a Date as dd/mm/yyyy (Indian date format) */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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

      {/* ── Log a Sale Form ─────────────────────────────────── */}
      <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border)] mb-8">
        <h2 className="text-lg font-semibold mb-4">Log a Sale</h2>
        {products.length === 0 ? (
          <p className="text-[var(--text-muted)]">
            No products exist yet. <a href="/products" className="text-[var(--accent)] hover:underline">Add a product</a> first.
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

      {/* ── Sales Log ───────────────────────────────────────── */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">Sales Log</h2>
          <p className="text-sm text-[var(--text-muted)]">{sales.length} entries, most recent first</p>
        </div>
        {sales.length === 0 ? (
          <p className="text-[var(--text-muted)] text-center py-12">No sales logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border)]">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium text-right">Qty</th>
                  <th className="p-4 font-medium text-right">Revenue</th>
                  <th className="p-4 font-medium text-right">Profit</th>
                  <th className="p-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-input)]/30 transition-colors">
                    <td className="p-4">
                      <form action={updateSale.bind(null, sale.id)} className="flex items-center gap-2">
                        <input
                          type="hidden"
                          name="productId"
                          value={sale.productId}
                        />
                        <input
                          type="date"
                          name="date"
                          defaultValue={toInputDate(sale.date)}
                          className="text-xs w-32"
                        />
                    </td>
                    <td className="p-4 text-[var(--text-secondary)]">{sale.product.name}</td>
                    <td className="p-4 text-right">
                        <input
                          type="number"
                          name="quantitySold"
                          defaultValue={sale.quantitySold}
                          min="1"
                          className="text-xs w-16 text-right"
                        />
                    </td>
                    <td className="p-4 text-right text-[var(--success)]">
                        <input
                          type="number"
                          name="revenueReceived"
                          defaultValue={sale.revenueReceived}
                          step="0.01"
                          min="0"
                          className="text-xs w-24 text-right"
                        />
                    </td>
                    <td className="p-4 text-right text-[var(--warning)]">{formatINR(sale.profit)}</td>
                    <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            type="submit"
                            className="text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white py-1 px-3 rounded transition-colors"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="text-xs bg-[var(--danger)] hover:bg-[var(--danger-hover)] text-white py-1 px-3 rounded transition-colors"
                            formAction={deleteSale.bind(null, sale.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
