export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';
import {
  createMarketingSpend,
  updateMarketingSpend,
  deleteMarketingSpend,
} from '@/app/actions/marketing-actions';

interface MarketingEntry {
  id: string;
  date: Date;
  channel: string | null;
  amount: number;
}

/** Format a number as Indian Rupees */
function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Convert date to yyyy-mm-dd for HTML date input */
function toInputDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default async function MarketingPage() {
  let entries: MarketingEntry[] = [];
  let dbError = false;

  try {
    entries = await prisma.marketingSpend.findMany({
      orderBy: { date: 'desc' },
    });
  } catch (error) {
    console.error('Database connection error on Marketing page:', error);
    dbError = true;
  }

  const totalSpend = entries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📢 Marketing</h1>

      {dbError && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-5 mb-8 flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-semibold text-amber-400 text-base">
            <span>⚡ Database Connection Pending</span>
          </div>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            Please set your Neon Postgres <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300">DATABASE_URL</code> in Vercel Settings → Environment Variables to enable marketing tracking.
          </p>
        </div>
      )}

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
        Total all-time marketing spend:{' '}
        <span className="text-[var(--warning)] font-semibold">{formatINR(totalSpend)}</span>
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
          <div className="space-y-0">
            {/* Grid header */}
            <div className="grid grid-cols-[120px_1fr_120px_140px] gap-2 px-4 py-3 text-xs text-[var(--text-muted)] border-b border-[var(--border)] font-medium">
              <span>Date</span>
              <span>Channel</span>
              <span className="text-right">Amount</span>
              <span className="text-center">Actions</span>
            </div>
            {/* Each entry as its own form */}
            {entries.map((entry) => (
              <form
                key={entry.id}
                action={updateMarketingSpend.bind(null, entry.id)}
                className="grid grid-cols-[120px_1fr_120px_140px] gap-2 px-4 py-3 items-center border-b border-[var(--border)] hover:bg-[var(--bg-input)]/30 transition-colors"
              >
                <input
                  type="date"
                  name="date"
                  defaultValue={toInputDate(entry.date)}
                  className="text-xs"
                />
                <input
                  type="text"
                  name="channel"
                  defaultValue={entry.channel || ''}
                  placeholder="No channel"
                  className="text-xs"
                />
                <input
                  type="number"
                  name="amount"
                  defaultValue={entry.amount}
                  step="0.01"
                  min="0"
                  className="text-xs text-right"
                />
                <div className="flex justify-center gap-2">
                  <button
                    type="submit"
                    className="text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white py-1 px-3 rounded transition-colors"
                  >
                    Save
                  </button>
                  <button
                    formAction={deleteMarketingSpend.bind(null, entry.id)}
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
