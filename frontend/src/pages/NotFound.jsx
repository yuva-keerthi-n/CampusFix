import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Logo from '../components/Logo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <Logo />
      <span className="mt-10 grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-brand-700">
        <Compass className="h-8 w-8" />
      </span>
      <p className="mt-6 text-6xl font-extrabold tracking-tight text-ink-900">404</p>
      <h1 className="mt-2 text-xl font-bold text-ink-900">This page doesn't exist</h1>
      <p className="mt-1 max-w-sm text-slate-500">The link may be broken or the page may have been moved.</p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="btn btn-secondary">
          Home
        </Link>
        <Link to="/dashboard" className="btn btn-primary">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
