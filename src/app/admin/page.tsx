'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EmergencyDetails {
  bloodType: string;
  allergies: string;
  medicalConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  address: string;
  notes: string;
  updatedAt: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  hasFaceScan: boolean;
  emergencyDetails: EmergencyDetails | null;
  completion: number;
}

interface AdminStats {
  totalUsers: number;
  withFaceScan: number;
  withEmergencyDetails: number;
  completeProfiles: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'complete' | 'missing' | 'face'>('all');

  const loadUsers = useCallback(async () => {
    const res = await fetch('/api/admin/users');
    const data = await res.json();

    if (!res.ok) {
      router.push('/admin/login');
      return;
    }

    setUsers(data.users);
    setStats(data.stats);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadUsers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery = !normalizedQuery
        || user.name.toLowerCase().includes(normalizedQuery)
        || user.email.toLowerCase().includes(normalizedQuery)
        || user.phone.toLowerCase().includes(normalizedQuery);

      const matchesFilter = filter === 'all'
        || (filter === 'complete' && user.completion === 100)
        || (filter === 'missing' && user.completion < 100)
        || (filter === 'face' && user.hasFaceScan);

      return matchesQuery && matchesFilter;
    });
  }, [filter, query, users]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const deleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name} and their emergency details?`)) return;

    setError('');
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Failed to delete user');
      return;
    }

    await loadUsers();
  };

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-neutral-100 text-neutral-700">Loading admin dashboard...</main>;
  }

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <div>
            <Link href="/" className="text-xl font-bold text-red-600">EmergencyFace</Link>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Admin dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/scan" className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-100">Scanner</Link>
            <button onClick={handleLogout} className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800">Admin logout</button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="rounded-lg bg-neutral-950 p-6 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-300">Control center</p>
          <h1 className="mt-2 text-3xl font-bold">Monitor emergency profile readiness</h1>
          <p className="mt-2 max-w-3xl text-neutral-300">Use this page during the hackathon demo to show admin oversight, profile health, face enrollment, and data management.</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric label="Users" value={String(stats?.totalUsers || 0)} />
          <Metric label="Face scans" value={String(stats?.withFaceScan || 0)} />
          <Metric label="Medical profiles" value={String(stats?.withEmergencyDetails || 0)} />
          <Metric label="Complete" value={String(stats?.completeProfiles || 0)} />
        </div>

        <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, or phone" className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
            <div className="grid grid-cols-4 rounded-md border border-neutral-200 bg-neutral-100 p-1 text-sm">
              {(['all', 'complete', 'missing', 'face'] as const).map((item) => (
                <button key={item} onClick={() => setFilter(item)} className={`rounded px-3 py-2 font-semibold capitalize ${filter === item ? 'bg-white text-red-600 shadow-sm' : 'text-neutral-600'}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
        </div>

        <div className="mt-6 space-y-4">
          {filteredUsers.map((user) => (
            <article key={user.id} className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <Badge label={`${user.completion}% ready`} tone={user.completion === 100 ? 'green' : 'amber'} />
                    <Badge label={user.hasFaceScan ? 'Face enrolled' : 'No face scan'} tone={user.hasFaceScan ? 'green' : 'neutral'} />
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">{user.email} • {user.phone}</p>
                  <p className="mt-1 text-xs text-neutral-500">Created {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => deleteUser(user.id, user.name)} className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                  Delete user
                </button>
              </div>

              {user.emergencyDetails ? (
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <Info label="Blood type" value={user.emergencyDetails.bloodType || 'Missing'} strong />
                  <Info label="Emergency contact" value={`${user.emergencyDetails.emergencyContactName || 'Missing'} ${user.emergencyDetails.emergencyContactPhone || ''}`} />
                  <Info label="Address" value={user.emergencyDetails.address || 'Missing'} />
                  <Info label="Allergies" value={user.emergencyDetails.allergies || 'None reported'} />
                  <Info label="Medical conditions" value={user.emergencyDetails.medicalConditions || 'None reported'} />
                  <Info label="Last updated" value={new Date(user.emergencyDetails.updatedAt).toLocaleDateString()} />
                </div>
              ) : (
                <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">No emergency details saved yet.</div>
              )}
            </article>
          ))}

          {filteredUsers.length === 0 && (
            <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-neutral-600 shadow-sm">No users match this view.</div>
          )}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: 'green' | 'amber' | 'neutral' }) {
  const styles = {
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    neutral: 'bg-neutral-100 text-neutral-600',
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[tone]}`}>{label}</span>;
}

function Info({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-md border border-neutral-200 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      <p className={`mt-1 ${strong ? 'text-xl font-bold text-red-600' : 'text-sm text-neutral-800'}`}>{value}</p>
    </div>
  );
}
