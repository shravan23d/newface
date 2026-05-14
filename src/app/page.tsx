import Link from 'next/link';

const features = [
  {
    title: 'Face-based identity',
    body: 'Register once with a camera scan so responders can identify the right profile quickly.',
  },
  {
    title: 'Medical essentials',
    body: 'Keep blood group, allergies, conditions, notes, address, and emergency contact details together.',
  },
  {
    title: 'Responder scan mode',
    body: 'The public scan page focuses on the camera, match status, and high-priority emergency details.',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.28),_transparent_34%),linear-gradient(135deg,_#111827_0%,_#020617_52%,_#1f2937_100%)]" />
        <header className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-white">
            EmergencyFace
          </Link>
          <nav className="grid w-full grid-cols-2 gap-2 text-sm sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
            <Link href="/scan" className="rounded-md border border-white/20 px-4 py-2 text-white hover:bg-white/10">
              Scan
            </Link>
            <Link href="/login" className="rounded-md px-4 py-2 text-white/80 hover:bg-white/10 hover:text-white">
              Login
            </Link>
            <Link href="/admin/login" className="rounded-md px-4 py-2 text-white/80 hover:bg-white/10 hover:text-white">
              Admin
            </Link>
            <Link href="/register" className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500">
              Register
            </Link>
          </nav>
        </header>

        <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-sm font-medium text-red-100">
              Emergency profile access for critical moments
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              EmergencyFace
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-300">
              A focused safety app that lets a registered user store emergency medical details and lets a responder scan a face to retrieve the profile.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="rounded-md bg-red-600 px-6 py-3 text-center font-semibold text-white hover:bg-red-500">
                Create safety profile
              </Link>
              <Link href="/scan" className="rounded-md border border-white/20 px-6 py-3 text-center font-semibold text-white hover:bg-white/10">
                Open emergency scanner
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="rounded-md bg-neutral-950 p-4">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-400">Responder view</p>
                  <p className="font-semibold">Matched emergency record</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">Verified</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-white/5 p-4">
                  <p className="text-xs text-neutral-400">Blood type</p>
                  <p className="mt-2 text-3xl font-bold text-red-300">O+</p>
                </div>
                <div className="rounded-md bg-white/5 p-4">
                  <p className="text-xs text-neutral-400">Emergency contact</p>
                  <p className="mt-2 font-semibold">Primary contact</p>
                  <p className="text-sm text-neutral-400">Tap to call</p>
                </div>
                <div className="col-span-2 rounded-md bg-white/5 p-4">
                  <p className="text-xs text-neutral-400">Critical notes</p>
                  <p className="mt-2 text-sm text-neutral-200">Allergies, conditions, address, and extra notes are shown in a clean priority layout.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-12 text-neutral-950 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-lg border border-neutral-200 bg-white p-5">
              <h2 className="text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
