import { prisma } from '@/lib/db';
import {
  createMarketingSpend,
  updateMarketingSpend,
  deleteMarketingSpend,
} from '@/app/actions/marketing-actions';

/** Format a number as Indian Rupees */
function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Convert date to yyyy-mm-dd for HTML date input */
function toInputDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default async function MarketingPage() {
  const entries = await prisma.marketingSpend.findMany({
    orderBy: { date: 'desc' },
  });

  const totalSpend = entries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📢 Marketing</h1>

      {/* ── Log Spend Form ── */}
      <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border)] mb-8">
        <h2 className="text-lg font-semibold mb-4">Log Marketing Spend</h2>
        <form action={createMarketingSpend} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Date</label>
            <input type="date" name="date" required defaultValue={toInputDate(new Date())} />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Channel (optional)</label>
            <input type="text" name="channel" placeholder="e.g. Instagram Ads, Google Ads" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Amount (₹)</label>
            <input type="number" name="amount" required step="0.01" min="0" placeholder="500" />
          </div>
          <div className="md:col-span-3">
            <button
              type="submit"
              className="bg-[var(--warning)] hover:bg-amber-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200"
            >
              + Log Spend
            </button>
          </div>
        </form>
      </div>

      {/* ── Total spend summary ── */}
      <div className="mb-4 text-sm text-[var(--text-secondary)]">
        Total all-time marketing spend: <span className="text-[var(--warning)] font-semibold">{formatINR(totalSpend)}</span>
      </div>

      {/* ── Spend Log ── */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">Marketing Spend Log</h2>
          <p className="text-sm text-[var(--text-muted)]">{entries.length} entries</p>
        </div>
        {entries.length === 0 ? (
          <p className="text-[var(--text-muted)] text-center py-12">No marketing spend logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border)]">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Channel</th>
                  <th className="p-4 font-medium text-right">Amount</th>
                  <th className="p-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-input)]/30 transition-colors">
                    <td className="p-4">
                      <form action={updateMarketingSpend.bind(null, entry.id)} className="flex items-center gap-2">
                        <input
                          type="date"
                          name="date"
                          defaultValue={toInputDate(entry.date)}
                          className="text-xs w-32"
                        />
                    </td>
                    <td className="p-4">
                        <input
                          type="text"
                          name="channel"
                          defaultValue={entry.channel || ''}
                          placeholder="No channel"
                          className="text-xs w-36"
                        />
                    </td>
                    <td className="p-4 text-right text-[var(--warning)]">
                        <input
                          type="number"
                          name="amount"
                          defaultValue={entry.amount}
                          step="0.01"
                          min="0"
                          className="text-xs w-24 text-right"
                        />
                    </td>
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
                            formAction={deleteMarketingSpend.bind(null, entry.id)}
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
