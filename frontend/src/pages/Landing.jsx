import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BellRing,
  Check,
  ClipboardCheck,
  Eye,
  LayoutList,
  MapPin,
  Rocket,
  Search,
  Send,
  Wrench,
} from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../hooks/useAuth';

const STEPS = [
  { icon: Send, title: 'Report', text: 'Snap a photo, pick the location and category, and describe what is broken. It takes under a minute.' },
  { icon: Eye, title: 'Track', text: 'Follow your complaint from review to assignment to repair, with a clear timeline and notifications.' },
  { icon: ClipboardCheck, title: 'Resolve', text: 'Maintenance staff fix the issue and add resolution notes, so you can see exactly what was done.' },
];

const WHY = [
  { icon: Rocket, title: 'Faster issue reporting', text: 'No more paper registers or chasing people. Report from any phone or laptop.' },
  { icon: Eye, title: 'Transparent tracking', text: 'Every status change is recorded, so nothing disappears into a black hole.' },
  { icon: Wrench, title: 'Better campus maintenance', text: 'Priorities and categories help staff fix the most urgent problems first.' },
  { icon: LayoutList, title: 'Centralized management', text: 'Admins see every complaint, assignment and trend in a single dashboard.' },
];

// A decorative preview of what a complaint looks like inside the app.
function TicketPreview() {
  const steps = ['Reported', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
  return (
    <div className="relative mx-auto w-full max-w-md rotate-1 rounded-2xl bg-white p-6 text-left shadow-2xl ring-1 ring-black/5" aria-hidden="true">
      <div className="flex items-center justify-between">
        <span className="rounded-md bg-ink-900 px-2 py-1 font-mono text-xs font-semibold text-white">CF-2026-0001</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> In Progress
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-ink-900">Broken ceiling fan in classroom</h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
        <MapPin className="h-4 w-4" /> CSE Block · Electrical
      </p>
      <ol className="mt-6 space-y-3">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${
                i < 3 ? 'bg-emerald-500 text-white' : i === 3 ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'border-2 border-slate-300 text-slate-400'
              }`}
            >
              {i < 3 ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={`text-sm font-medium ${i <= 3 ? 'text-ink-900' : 'text-slate-400'}`}>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-canvas">
      <header className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Logo light />
          <nav className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard" className="btn bg-white text-ink-900 hover:bg-slate-100">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn hidden text-slate-200 hover:bg-white/10 sm:inline-flex">
                  Sign up
                </Link>
                <Link to="/login" className="btn bg-white text-ink-900 hover:bg-slate-100">
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-600/25 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-32 lg:grid-cols-2 lg:pb-28 lg:pt-40">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-400">
              <BellRing className="h-3.5 w-3.5" /> Smart college issue reporting
            </p>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">CampusFix</h1>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-brand-500 sm:text-4xl">Report. Track. Resolve.</p>
            <p className="mt-6 max-w-lg text-lg text-slate-300">
              Making every campus problem easier to report, track and resolve.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/report" className="btn btn-primary px-6 py-3 text-base">
                Report an Issue <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn border border-white/25 px-6 py-3 text-base text-white hover:bg-white/10">
                Login
              </Link>
            </div>
          </div>
          <TicketPreview />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-12 max-w-xl">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-600">How it works</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900">Three steps from problem to fixed</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="card relative p-7">
              <span className="absolute right-6 top-5 text-5xl font-extrabold text-slate-100">{i + 1}</span>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-700">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-ink-900">{title}</h3>
              <p className="mt-2 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why CampusFix */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-12 max-w-xl">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600">Why CampusFix?</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900">Built for how campuses really work</h2>
          </div>
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {WHY.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink-900 text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-ink-900">{title}</h3>
                  <p className="mt-1 text-slate-600">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-600 p-10 text-white md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">See something broken? Tell us.</h2>
            <p className="mt-2 text-brand-100">Every report helps make the campus better for everyone.</p>
          </div>
          <Link to="/report" className="btn bg-white px-6 py-3 text-base text-brand-700 hover:bg-brand-50">
            <Search className="h-4 w-4" /> Report an Issue
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        CampusFix · Smart College Issue Reporting System
      </footer>
    </div>
  );
}
