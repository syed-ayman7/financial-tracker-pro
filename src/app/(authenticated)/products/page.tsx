export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';
import { createProduct, updateProduct, deleteProduct } from '@/app/actions/product-actions';

export default async function ProductsPage() {
  let products: any[] = [];
  let dbError = false;

  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Database connection error on Products page:', error);
    dbError = true;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📦 Products</h1>

      {dbError && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-5 mb-8 flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-semibold text-amber-400 text-base">
            <span>⚡ Database Connection Pending</span>
          </div>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            Please set your Neon Postgres <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300">DATABASE_URL</code> in Vercel Settings → Environment Variables to enable product management.
          </p>
        </div>
      )}

      {/* ── Add Product Form ────────────────────────────────── */}
      <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border)] mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Product</h2>
        <form action={createProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Product Name</label>
            <input type="text" name="name" required placeholder="e.g. Handmade Candle" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Price Per Unit (₹)</label>
            <input type="number" name="pricePerUnit" required step="0.01" min="0" placeholder="500" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Profit Margin (%)</label>
            <input type="number" name="profitMarginPct" required step="0.01" min="0" max="100" placeholder="40" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Units Manufactured</label>
            <input type="number" name="unitsManufactured" min="0" defaultValue="0" placeholder="0" />
          </div>
          <div className="md:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200"
            >
              + Add Product
            </button>
          </div>
        </form>
      </div>

      {/* ── Product List ────────────────────────────────────── */}
      {products.length === 0 ? (
        <p className="text-[var(--text-muted)] text-center py-12">No products yet. Add your first product above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border)] hover:border-[var(--accent)] transition-colors duration-200"
            >
              <form action={updateProduct.bind(null, product.id)}>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Name</label>
                    <input type="text" name="name" defaultValue={product.name} required className="text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1">Price (₹)</label>
                      <input
                        type="number"
                        name="pricePerUnit"
                        defaultValue={product.pricePerUnit}
                        required
                        step="0.01"
                        min="0"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1">Margin (%)</label>
                      <input
                        type="number"
                        name="profitMarginPct"
                        defaultValue={product.profitMarginPct}
                        required
                        step="0.01"
                        min="0"
                        max="100"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Units Manufactured</label>
                    <input
                      type="number"
                      name="unitsManufactured"
                      defaultValue={product.unitsManufactured}
                      min="0"
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="bg-[var(--danger)] hover:bg-[var(--danger-hover)] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                    formAction={deleteProduct.bind(null, product.id)}
                  >
                    Delete
                  </button>
                </div>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
