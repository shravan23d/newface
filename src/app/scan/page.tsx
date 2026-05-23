'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFaceCamera } from '@/hooks/useFaceCamera';

interface ScanResult {
  user: { name: string; phone: string };
  emergencyDetails: {
    age: string;
    gender: string;
    organDonor: string;
    bloodType: string;
    allergies: string;
    medicalConditions: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
    address: string;
    notes: string;
  } | null;
  match: {
    confidence: number;
    distance: number;
  };
}

export default function ScanPage() {
  const camera = useFaceCamera(true);
  const { videoRef, status, error: cameraError, faceDetected, faceDescriptor, detectionCount, captureFace, retry } = camera;
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [nightMode, setNightMode] = useState(true);

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

  const criticalAlerts = [
    details?.allergies ? `Allergy: ${details.allergies}` : '',
    details?.medicalConditions ? details.medicalConditions : '',
  ].filter(Boolean);

  return (
    <main className={`min-h-screen ${nightMode ? 'bg-neutral-950 text-white' : 'bg-red-50 text-neutral-950'}`}>
      <header className={`border-b ${nightMode ? 'border-white/10 bg-neutral-950' : 'border-red-100 bg-white'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className={`text-xl font-bold ${nightMode ? 'text-white' : 'text-red-600'}`}>EmergencyFace</Link>
          <div className="flex gap-2">
            <button onClick={() => setNightMode((value) => !value)} className={`rounded-md px-4 py-2 text-sm font-semibold ${nightMode ? 'bg-white/10 text-white' : 'bg-neutral-950 text-white'}`}>
              {nightMode ? 'Day' : 'Night'}
            </button>
            <Link href="/login" className={`rounded-md px-4 py-2 text-sm font-semibold ${nightMode ? 'text-white/80 hover:bg-white/10' : 'text-neutral-700 hover:bg-red-100'}`}>Login</Link>
            <Link href="/register" className={`rounded-md px-4 py-2 text-sm font-semibold ${nightMode ? 'bg-white text-neutral-950 hover:bg-neutral-200' : 'bg-red-600 text-white hover:bg-red-700'}`}>Register</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wide ${nightMode ? 'text-red-300' : 'text-red-600'}`}>Emergency scanner</p>
              <h1 className="mt-2 text-3xl font-bold">Identify and retrieve details</h1>
            </div>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${faceDetected ? 'bg-emerald-400/15 text-emerald-200' : 'bg-red-400/15 text-red-200'}`}>
              {faceDetected ? 'Face detected' : 'No face detected'}
            </span>
          </div>

          <div className="relative aspect-[4/6] overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl sm:aspect-video">
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

        <aside className={`${scanResult ? 'overflow-hidden p-0' : 'p-5'} rounded-[28px] border border-white/10 bg-white text-neutral-950 shadow-2xl`}>
          {scanResult ? (
            <div>
              <div className="bg-red-600 px-6 py-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-xl bg-white/15 text-2xl">+</div>
                    <div>
                      <p className="text-3xl font-black uppercase leading-tight tracking-wide">Emergency<br />Access</p>
                      <p className="mt-1 font-mono text-sm uppercase text-red-100">Biometric match: {scanResult.match.confidence.toFixed(1)}%</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setScanResult(null)} className="text-4xl leading-none text-white/70 hover:text-white">x</button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-red-50 text-5xl">!</div>
                  <div>
                    <h2 className="text-3xl font-black leading-tight text-slate-950">{scanResult.user.name}</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {details?.age && <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">{details.age} YRS</span>}
                      {details?.gender && <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-bold uppercase text-slate-600">{details.gender}</span>}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
                  <p className="font-black uppercase tracking-wide text-red-700">Critical alerts</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-lg font-black uppercase text-red-800">
                    {(criticalAlerts.length ? criticalAlerts : ['No critical alerts reported']).map((alert) => <li key={alert}>{alert}</li>)}
                  </ul>
                </div>

                {details ? (
                  <div className="mt-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <StatCard label="Blood type" value={details.bloodType || 'N/A'} />
                      <StatCard label="Donor" value={details.organDonor || 'Unknown'} green={details.organDonor === 'Yes'} />
                    </div>
                    <div>
                      <p className="mb-3 text-sm font-black uppercase tracking-wide text-slate-400">Emergency contacts</p>
                      <div className="rounded-2xl bg-emerald-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-lg font-black">{details.emergencyContactName || 'Not provided'} {details.emergencyContactRelation && `(${details.emergencyContactRelation})`}</p>
                            <p className="text-slate-500">Primary Contact</p>
                          </div>
                          {details.emergencyContactPhone && <a href={`tel:${details.emergencyContactPhone}`} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-black text-white">CALL</a>}
                        </div>
                      </div>
                    </div>
                    <InfoBlock title="Address" value={details.address || 'Not provided'} />
                    {details.address && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(details.address)}`} target="_blank" rel="noreferrer" className="block rounded-md border border-slate-200 px-4 py-3 text-center font-bold text-slate-700">Open address in Maps</a>}
                    {details.notes && <InfoBlock title="Notes" value={details.notes} />}
                  </div>
                ) : (
                  <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800">This matched user has not added emergency details yet.</div>
                )}
              </div>
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

function StatCard({ label, value, green = false }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
      <p className="text-sm font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-black ${green ? 'text-emerald-600' : 'text-slate-950'}`}>{value}</p>
    </div>
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
