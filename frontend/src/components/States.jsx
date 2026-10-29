import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';

export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export function PageLoader({ text = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Spinner className="h-7 w-7 text-brand-600" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-600">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h3 className="text-base font-semibold text-red-900">Something went wrong</h3>
      <p className="mt-1 max-w-md text-sm text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm mt-4">
          Try again
        </button>
      )}
    </div>
  );
}
