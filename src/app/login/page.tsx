import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Simple password gate.
 * Compares the submitted password against APP_PASSWORD (default: 'admin123').
 * On success, sets a cookie so the middleware lets subsequent requests through.
 */
export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  async function login(formData: FormData) {
    'use server';
    const password = formData.get('password') as string;
    const expectedPassword = process.env.APP_PASSWORD || 'admin123';

    if (password === expectedPassword) {
      cookies().set('fin-tracker-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
      redirect('/dashboard');
    } else {
      redirect('/login?error=1');
    }
  }

  const isError = searchParams?.error === '1';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <div className="bg-[var(--bg-card)] rounded-xl p-8 border border-[var(--border)] w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">🔒 Fin-Tracker</h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Enter your password to access the dashboard
          </p>
        </div>

        {isError && (
          <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            Incorrect password. Please try again.
          </div>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              placeholder="Enter password"
              className="w-full"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium py-2.5 rounded-lg transition-colors duration-200"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
