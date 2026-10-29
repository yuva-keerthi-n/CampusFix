import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';

const POINTS = ['Report a problem in under a minute', 'Follow every step until it is fixed', 'Get notified the moment it is resolved'];

// Split-screen layout shared by Login and Register.
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
        <Link to="/" className="relative">
          <Logo light />
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            Report.
            <br />
            Track.
            <br />
            <span className="text-brand-500">Resolve.</span>
          </h2>
          <ul className="mt-8 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="h-5 w-5 text-brand-500" /> {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-slate-500">Making every campus problem easier to report, track and resolve.</p>
      </div>

      <div className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-block lg:hidden">
            <Logo />
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{title}</h1>
          <p className="mb-8 mt-1.5 text-sm text-slate-500">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
