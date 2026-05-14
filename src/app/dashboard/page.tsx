'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface EmergencyDetails {
  id: string;
  userId: string;
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

const requiredFields: Array<keyof EmergencyDetails> = ['bloodType', 'emergencyContactName', 'emergencyContactPhone', 'address'];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [emergencyDetails, setEmergencyDetails] = useState<EmergencyDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/me');
      const data = await res.json();

      if (!res.ok) {
        router.push('/login');
        return;
      }

      setUser(data.user);
      setEmergencyDetails(data.emergencyDetails);
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const completion = useMemo(() => {
    if (!emergencyDetails) return 0;
    const filled = requiredFields.filter((field) => Boolean(emergencyDetails[field])).length;
    return Math.round((filled / requiredFields.length) * 100);
  }, [emergencyDetails]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-neutral-100 text-neutral-700">Loading dashboard...</main>;
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link href="/dashboard" className="text-xl font-bold text-red-600">EmergencyFace</Link>
          <div className="flex items-center gap-2">
            <Link href="/scan" className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-100">Scan</Link>
            <button onClick={handleLogout} className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800">Logout</button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="rounded-lg bg-neutral-950 p-6 text-white shadow-sm">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-red-300">Personal safety profile</p>
              <h1 className="mt-2 text-3xl font-bold">Hello, {user.name}</h1>
              <p className="mt-2 text-neutral-300">Keep this profile current so the emergency scanner returns useful details when they matter.</p>
            </div>
            <Link href="/emergency" className="rounded-md bg-red-600 px-5 py-3 text-center font-semibold text-white hover:bg-red-500">
              {emergencyDetails ? 'Update emergency details' : 'Add emergency details'}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric label="Profile status" value={`${completion}%`} />
          <Metric label="Blood type" value={emergencyDetails?.bloodType || 'Missing'} />
          <Metric label="Phone" value={user.phone} />
          <Metric label="Last updated" value={emergencyDetails ? new Date(emergencyDetails.updatedAt).toLocaleDateString() : 'Never'} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
              <div>
                <h2 className="text-2xl font-bold">Emergency details</h2>
                <p className="text-sm text-neutral-600">Information shown to the scanner after a match.</p>
              </div>
              <Link href="/emergency" className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Edit</Link>
            </div>

            {emergencyDetails ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Detail label="Allergies" value={emergencyDetails.allergies || 'None reported'} />
                <Detail label="Medical conditions" value={emergencyDetails.medicalConditions || 'None reported'} />
                <Detail label="Address" value={emergencyDetails.address || 'Not provided'} />
                <Detail label="Notes" value={emergencyDetails.notes || 'No additional notes'} />
                <div className="rounded-md border border-neutral-200 p-4 md:col-span-2">
                  <p className="text-sm font-semibold text-neutral-500">Emergency contact</p>
                  <p className="mt-1 text-lg font-bold">{emergencyDetails.emergencyContactName || 'Not provided'}</p>
                  <p className="font-semibold text-red-600">{emergencyDetails.emergencyContactPhone || 'No phone number'}</p>
                  <p className="text-sm text-neutral-500">{emergencyDetails.emergencyContactRelation || 'Relationship not provided'}</p>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-5 text-amber-800">
                No emergency details have been saved yet. Add blood type, contact, address, and medical notes before using the scanner in a real scenario.
              </div>
            )}
          </section>

          <aside className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Quick actions</h2>
            <div className="mt-4 space-y-3">
              <Link href="/emergency" className="block rounded-md border border-neutral-200 p-4 hover:bg-neutral-50">
                <p className="font-semibold">Edit medical profile</p>
                <p className="mt-1 text-sm text-neutral-600">Update critical fields and contact details.</p>
              </Link>
              <Link href="/scan" className="block rounded-md border border-red-200 bg-red-50 p-4 hover:bg-red-100">
                <p className="font-semibold text-red-700">Open scanner</p>
                <p className="mt-1 text-sm text-red-700">Test face matching and emergency output.</p>
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-neutral-500">{label}</p>
      <p className="mt-2 truncate text-xl font-bold">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-neutral-200 p-4">
      <p className="text-sm font-semibold text-neutral-500">{label}</p>
      <p className="mt-1 leading-6">{value}</p>
    </div>
  );
}
