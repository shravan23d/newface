'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const initialForm = {
  bloodType: '',
  allergies: '',
  medicalConditions: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  address: '',
  notes: '',
};

const bloodTypes = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EmergencyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      const res = await fetch('/api/emergency');
      const data = await res.json();

      if (!res.ok) {
        router.push('/login');
        return;
      }

      if (data.emergencyDetails) {
        setFormData({
          bloodType: data.emergencyDetails.bloodType || '',
          allergies: data.emergencyDetails.allergies || '',
          medicalConditions: data.emergencyDetails.medicalConditions || '',
          emergencyContactName: data.emergencyDetails.emergencyContactName || '',
          emergencyContactPhone: data.emergencyDetails.emergencyContactPhone || '',
          emergencyContactRelation: data.emergencyDetails.emergencyContactRelation || '',
          address: data.emergencyDetails.address || '',
          notes: data.emergencyDetails.notes || '',
        });
      }
      setPageLoading(false);
    };

    fetchDetails();
  }, [router]);

  const completion = useMemo(() => {
    const required = [formData.bloodType, formData.emergencyContactName, formData.emergencyContactPhone, formData.address];
    return Math.round((required.filter(Boolean).length / required.length) * 100);
  }, [formData]);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save emergency details');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 900);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <main className="grid min-h-screen place-items-center bg-neutral-100 text-neutral-700">Loading emergency form...</main>;
  }

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/dashboard" className="text-xl font-bold text-red-600">EmergencyFace</Link>
          <Link href="/dashboard" className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-100">Dashboard</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Medical profile</p>
              <h1 className="mt-2 text-3xl font-bold">Emergency details</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">These details appear on the scan result after a face match. Fill the key fields first, then add extra context.</p>
            </div>
            <div className="rounded-md bg-neutral-100 px-4 py-3 text-center">
              <p className="text-xs text-neutral-500">Ready score</p>
              <p className="text-2xl font-bold">{completion}%</p>
            </div>
          </div>

          {error && <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
          {success && <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">Emergency details saved.</div>}

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium">
              Blood type
              <select value={formData.bloodType} onChange={(e) => updateField('bloodType', e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100">
                {bloodTypes.map((type) => <option key={type} value={type}>{type || 'Select blood type'}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Address or pickup location
              <input value={formData.address} onChange={(e) => updateField('address', e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
            </label>
            <label className="block text-sm font-medium md:col-span-2">
              Allergies
              <textarea rows={3} value={formData.allergies} onChange={(e) => updateField('allergies', e.target.value)} placeholder="Medication, food, or environmental allergies" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
            </label>
            <label className="block text-sm font-medium md:col-span-2">
              Medical conditions
              <textarea rows={3} value={formData.medicalConditions} onChange={(e) => updateField('medicalConditions', e.target.value)} placeholder="Diabetes, heart condition, asthma, implants, current medication" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
            </label>
          </div>

          <div className="mt-8 border-t border-neutral-200 pt-6">
            <h2 className="text-xl font-bold">Emergency contact</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              <label className="block text-sm font-medium">
                Name
                <input value={formData.emergencyContactName} onChange={(e) => updateField('emergencyContactName', e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </label>
              <label className="block text-sm font-medium">
                Phone
                <input type="tel" value={formData.emergencyContactPhone} onChange={(e) => updateField('emergencyContactPhone', e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </label>
              <label className="block text-sm font-medium">
                Relation
                <input value={formData.emergencyContactRelation} onChange={(e) => updateField('emergencyContactRelation', e.target.value)} placeholder="Parent, spouse, friend" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </label>
            </div>
          </div>

          <label className="mt-6 block text-sm font-medium">
            Additional notes
            <textarea rows={4} value={formData.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Anything a responder should know immediately" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
          </label>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button disabled={loading} className="rounded-md bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-400">
              {loading ? 'Saving...' : 'Save details'}
            </button>
            <Link href="/dashboard" className="rounded-md border border-neutral-300 px-6 py-3 text-center font-semibold hover:bg-neutral-100">Cancel</Link>
          </div>
        </form>

        <aside className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Priority checklist</h2>
          <div className="mt-4 space-y-3 text-sm">
            <ChecklistItem label="Blood type" done={Boolean(formData.bloodType)} />
            <ChecklistItem label="Emergency contact name" done={Boolean(formData.emergencyContactName)} />
            <ChecklistItem label="Emergency contact phone" done={Boolean(formData.emergencyContactPhone)} />
            <ChecklistItem label="Address or location" done={Boolean(formData.address)} />
          </div>
        </aside>
      </section>
    </main>
  );
}

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2">
      <span>{label}</span>
      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${done ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>{done ? 'Done' : 'Missing'}</span>
    </div>
  );
}
