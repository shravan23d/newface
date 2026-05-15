'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFaceCamera } from '@/hooks/useFaceCamera';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMode, setLoginMode] = useState<'credentials' | 'face'>('credentials');
  const camera = useFaceCamera(loginMode === 'face');
  const { videoRef, status, faceDetected, faceDescriptor: currentFaceDescriptor, detectionCount, error: cameraError, captureFace } = camera;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const descriptor = loginMode === 'face'
        ? currentFaceDescriptor.length ? currentFaceDescriptor : await captureFace()
        : undefined;

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginMode === 'credentials' ? email : undefined,
          password: loginMode === 'credentials' ? password : undefined,
          faceDescriptor: descriptor,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/dashboard');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="text-xl font-bold text-red-600">EmergencyFace</Link>
          <Link href="/scan" className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-100">Emergency scan</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Secure access</p>
          <h1 className="mt-2 text-3xl font-bold">Sign in</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Use email and password, or switch to face login when your camera is available.</p>

          <div className="mt-6 grid grid-cols-2 rounded-md border border-neutral-200 bg-neutral-100 p-1">
            <button type="button" onClick={() => { setLoginMode('credentials'); setError(''); }} className={`rounded px-3 py-2 text-sm font-semibold ${loginMode === 'credentials' ? 'bg-white text-red-600 shadow-sm' : 'text-neutral-600'}`}>
              Password
            </button>
            <button type="button" onClick={() => { setLoginMode('face'); setError(''); }} className={`rounded px-3 py-2 text-sm font-semibold ${loginMode === 'face' ? 'bg-white text-red-600 shadow-sm' : 'text-neutral-600'}`}>
              Face
            </button>
          </div>

          {error && <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
          {cameraError && loginMode === 'face' && <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{cameraError}</div>}

          {loginMode === 'credentials' ? (
            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium">
                Email
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </label>
              <label className="block text-sm font-medium">
                Password
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </label>
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-950 p-3">
              <div className="relative aspect-[4/6] overflow-hidden rounded-md sm:aspect-video">
                <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
                {status !== 'ready' && <div className="absolute inset-0 grid place-items-center bg-black/70 text-sm font-medium text-white">Preparing camera</div>}
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-white">
                <span>{faceDetected ? 'Face detected' : 'Waiting for face'}</span>
                <span>{detectionCount} samples</span>
              </div>
            </div>
          )}

          <button disabled={loading || (loginMode === 'face' && status !== 'ready')} className="mt-6 w-full rounded-md bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-400">
            {loading ? 'Signing in...' : loginMode === 'face' ? 'Sign in with face' : 'Sign in'}
          </button>
          <p className="mt-4 text-center text-sm text-neutral-600">Need a profile? <Link href="/register" className="font-semibold text-red-600 hover:underline">Register</Link></p>
        </form>

        <aside className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Responder-ready profile access</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">After login, keep emergency data updated from the dashboard. The scanner only returns essentials needed in an emergency.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/dashboard" className="rounded-md border border-neutral-200 p-4 hover:bg-neutral-50">
              <p className="font-semibold">Dashboard</p>
              <p className="mt-1 text-sm text-neutral-600">Review profile and emergency details.</p>
            </Link>
            <Link href="/scan" className="rounded-md border border-red-200 bg-red-50 p-4 hover:bg-red-100">
              <p className="font-semibold text-red-700">Emergency scanner</p>
              <p className="mt-1 text-sm text-red-700">Open camera scan mode.</p>
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
