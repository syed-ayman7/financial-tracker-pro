import Link from 'next/link';

/** Navigation links shown in the sidebar */
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/products', label: 'Products', icon: '📦' },
  { href: '/sales', label: 'Sales', icon: '💰' },
  { href: '/marketing', label: 'Marketing', icon: '📢' },
];

/**
 * Shared layout for the dashboard group.
 * Provides the sidebar navigation that wraps all authenticated pages
 * (dashboard, products, sales, marketing). The login page has its own
 * bare layout, so it doesn't get the sidebar.
 */
export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-[var(--border)]">
          <h1 className="text-xl font-bold text-white">💼 Fin-Tracker</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Financial Dashboard
          </p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-input)] transition-all duration-200"
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] text-center">
            Made-to-Order Business Tracker
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
