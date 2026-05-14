'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFaceCamera } from '@/hooks/useFaceCamera';

interface ScanResult {
  user: { name: string; phone: string };
  emergencyDetails: {
    bloodType: string;
    allergies: string;
    medicalConditions: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
    address: string;
    notes: string;
  } | null;
}

export default function ScanPage() {
  const camera = useFaceCamera(true);
  const { videoRef, status, error: cameraError, faceDetected, faceDescriptor, detectionCount, captureFace, retry } = camera;
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setError('');
    setScanResult(null);
    setIsScanning(true);

    try {
      const descriptor = faceDescriptor.length ? faceDescriptor : await captureFace();
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faceDescriptor: descriptor }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'No matching user found');
        return;
      }

      setScanResult(data);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : 'Scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const details = scanResult?.emergencyDetails;

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-white/10 bg-neutral-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="text-xl font-bold text-white">EmergencyFace</Link>
          <div className="flex gap-2">
            <Link href="/login" className="rounded-md px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10">Login</Link>
            <Link href="/register" className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-neutral-200">Register</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-red-300">Emergency scanner</p>
              <h1 className="mt-2 text-3xl font-bold">Identify and retrieve details</h1>
            </div>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${camera.faceDetected ? 'bg-emerald-400/15 text-emerald-200' : 'bg-red-400/15 text-red-200'}`}>
              {faceDetected ? 'Face detected' : 'No face detected'}
            </span>
          </div>

          <div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl">
            <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
            {status !== 'ready' && (
              <div className="absolute inset-0 grid place-items-center bg-black/70 px-4 text-center font-medium">
                <div>
                  <p>{status === 'error' ? 'Camera unavailable' : 'Preparing camera and models'}</p>
                  {status === 'error' && (
                    <button type="button" onClick={retry} className="mt-3 rounded-md bg-white px-3 py-2 text-xs font-semibold text-neutral-950 hover:bg-neutral-200">
                      Retry camera
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <button disabled={!faceDetected || isScanning || status !== 'ready'} onClick={handleScan} className="rounded-md bg-red-600 px-5 py-4 text-lg font-bold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-neutral-600">
              {isScanning ? 'Scanning...' : 'Scan face'}
            </button>
            <div className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-300">
              <p className="font-semibold text-white">{detectionCount} face samples</p>
              <p>Keep the face centered before scanning.</p>
            </div>
          </div>

          {(error || cameraError) && (
            <div className="mt-4 rounded-md border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-100">
              <p>{error || cameraError}</p>
              {cameraError && <button type="button" onClick={retry} className="mt-3 rounded-md bg-white px-3 py-2 text-xs font-semibold text-neutral-950 hover:bg-neutral-200">Retry camera</button>}
            </div>
          )}
        </div>

        <aside className="rounded-lg border border-white/10 bg-white p-5 text-neutral-950 shadow-2xl">
          {scanResult ? (
            <div>
              <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Matched profile</p>
                  <h2 className="mt-1 text-3xl font-bold">{scanResult.user.name}</h2>
                  <a href={`tel:${scanResult.user.phone}`} className="mt-2 inline-block font-semibold text-red-600 hover:underline">{scanResult.user.phone}</a>
                </div>
                <div className="rounded-md bg-red-50 px-4 py-3 text-center">
                  <p className="text-xs text-red-700">Blood type</p>
                  <p className="text-3xl font-bold text-red-700">{details?.bloodType || 'N/A'}</p>
                </div>
              </div>

              {details ? (
                <div className="mt-5 space-y-4">
                  <InfoBlock title="Allergies" value={details.allergies || 'None reported'} urgent />
                  <InfoBlock title="Medical conditions" value={details.medicalConditions || 'None reported'} />
                  <InfoBlock title="Address" value={details.address || 'Not provided'} />
                  <div className="rounded-md border border-neutral-200 p-4">
                    <p className="text-sm font-semibold text-neutral-500">Emergency contact</p>
                    <p className="mt-1 text-lg font-bold">{details.emergencyContactName || 'Not provided'}</p>
                    {details.emergencyContactPhone && <a href={`tel:${details.emergencyContactPhone}`} className="font-semibold text-red-600 hover:underline">{details.emergencyContactPhone}</a>}
                    {details.emergencyContactRelation && <p className="text-sm text-neutral-500">{details.emergencyContactRelation}</p>}
                  </div>
                  {details.notes && <InfoBlock title="Notes" value={details.notes} />}
                </div>
              ) : (
                <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800">This user has not added emergency details yet.</div>
              )}
            </div>
          ) : (
            <div className="grid min-h-[420px] place-items-center text-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Ready for result</p>
                <h2 className="mt-2 text-2xl font-bold">Scan result appears here</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-600">When a registered face matches, this panel switches to emergency information with call links for contacts.</p>
              </div>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

function InfoBlock({ title, value, urgent = false }: { title: string; value: string; urgent?: boolean }) {
  return (
    <div className={`rounded-md border p-4 ${urgent ? 'border-red-200 bg-red-50' : 'border-neutral-200 bg-white'}`}>
      <p className={`text-sm font-semibold ${urgent ? 'text-red-700' : 'text-neutral-500'}`}>{title}</p>
      <p className="mt-1 leading-6">{value}</p>
    </div>
  );
}
