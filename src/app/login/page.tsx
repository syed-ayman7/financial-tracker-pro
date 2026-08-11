import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Simple password gate.
 * Compares the submitted password against the APP_PASSWORD env var.
 * On success, sets a cookie so the middleware lets subsequent requests through.
 */
export default function LoginPage() {
  async function login(formData: FormData) {
    'use server';
    const password = formData.get('password') as string;

    if (password === process.env.APP_PASSWORD) {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="bg-[var(--bg-card)] rounded-xl p-8 border border-[var(--border)] w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">🔒 Fin-Tracker</h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Enter your password to access the dashboard
          </p>
        </div>
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
