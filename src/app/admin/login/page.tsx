'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@emergencyface.local');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Admin login failed');
        return;
      }

      router.push('/admin');
    } catch {
      setError('Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-950 px-5 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-white/10 bg-white p-6 text-neutral-950 shadow-2xl">
        <Link href="/" className="text-xl font-bold text-red-600">EmergencyFace</Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-red-600">Admin access</p>
        <h1 className="mt-2 text-3xl font-bold">Control center</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">Review users, emergency profile readiness, face enrollment, and demo data.</p>

        {error && <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Admin email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
          </label>
          <label className="block text-sm font-medium">
            Admin password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
          </label>
        </div>

        <button disabled={loading} className="mt-6 w-full rounded-md bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-400">
          {loading ? 'Signing in...' : 'Open admin dashboard'}
        </button>
        <p className="mt-4 text-center text-xs text-neutral-500">Default demo credentials can be changed with ADMIN_EMAIL and ADMIN_PASSWORD in `.env`.</p>
      </form>
    </main>
  );
}
