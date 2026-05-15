'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFaceCamera } from '@/hooks/useFaceCamera';

export default function RegisterPage() {
  const router = useRouter();
  const camera = useFaceCamera(true);
  const { videoRef, status, error: cameraError, faceDetected, faceDescriptor, detectionCount, logs, captureFace, retry } = camera;
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statusText = status === 'loading-models'
    ? 'Loading face models'
    : status === 'starting-camera'
      ? 'Starting camera'
      : status === 'ready'
        ? faceDetected ? 'Face ready' : 'Center your face'
        : status === 'error'
          ? 'Camera unavailable'
          : 'Preparing';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      let faceDescriptorForSubmit = faceDescriptor;
      if (!faceDescriptorForSubmit.length && status === 'ready' && faceDetected) {
        faceDescriptorForSubmit = await captureFace();
      }
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, faceDescriptor: faceDescriptorForSubmit }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      router.push('/dashboard');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="text-xl font-bold text-red-600">EmergencyFace</Link>
          <Link href="/login" className="rounded-md px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100">Login</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">New profile</p>
          <h1 className="mt-2 text-3xl font-bold">Create emergency profile</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Your face scan links this account to emergency details you can add after registration.</p>

          {error && <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
          {cameraError && (
            <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p>{cameraError} You can still create your profile and use password login.</p>
              <button type="button" onClick={retry} className="mt-3 rounded-md bg-amber-900 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-800">
                Retry camera
              </button>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium">
              Full name
              <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
            </label>
            <label className="block text-sm font-medium">
              Email
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input type="password" required minLength={6} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
            </label>
            <label className="block text-sm font-medium">
              Phone number
              <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
            </label>
          </div>

          <button disabled={loading} className="mt-6 w-full rounded-md bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-400">
            {loading ? 'Creating profile...' : 'Create profile'}
          </button>
          <p className="mt-4 text-center text-sm text-neutral-600">Already registered? <Link href="/login" className="font-semibold text-red-600 hover:underline">Sign in</Link></p>
        </form>

        <aside className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Face registration</h2>
              <p className="text-sm text-neutral-600">Good lighting and a centered face improve matching. If camera access is blocked, you can add medical details after creating the profile.</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${faceDetected ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-700'}`}>{statusText}</span>
          </div>

          <div className="relative aspect-[4/6] overflow-hidden rounded-lg bg-neutral-950 sm:aspect-video">
            <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
            {status !== 'ready' && (
              <div className="absolute inset-0 grid place-items-center bg-black/70 px-4 text-center text-sm font-medium text-white">
                <div>
                  <p>{statusText}</p>
                  {status === 'error' && (
                    <button type="button" onClick={retry} className="mt-3 rounded-md bg-white px-3 py-2 text-xs font-semibold text-neutral-950 hover:bg-neutral-200">
                      Retry camera
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md bg-neutral-100 p-3">
              <p className="text-xs text-neutral-500">Face status</p>
              <p className="font-semibold">{faceDetected ? 'Detected' : 'Waiting'}</p>
            </div>
            <div className="rounded-md bg-neutral-100 p-3">
              <p className="text-xs text-neutral-500">Samples</p>
              <p className="font-semibold">{detectionCount}</p>
            </div>
            <div className="rounded-md bg-neutral-100 p-3">
              <p className="text-xs text-neutral-500">Model</p>
              <p className="font-semibold">{status === 'ready' ? 'Ready' : 'Loading'}</p>
            </div>
          </div>

          <details className="mt-4 rounded-md border border-neutral-200 p-3 text-sm">
            <summary className="cursor-pointer font-semibold">Diagnostics</summary>
            <div className="mt-2 max-h-32 overflow-y-auto font-mono text-xs text-neutral-600">
              {logs.map((log, index) => <div key={`${log}-${index}`}>{log}</div>)}
            </div>
          </details>
        </aside>
      </section>
    </main>
  );
}
