import { Check, X } from 'lucide-react';
import { TRACK_STEPS, statusLabel } from '../utils/status';
import { formatDateTime } from '../utils/format';

// Visual progress tracker: Reported → Under Review → Assigned → In Progress → Resolved.
// Rejected complaints show a shorter path that ends in a red "Rejected" step.
export default function StatusTracker({ status, history = [] }) {
  const rejected = status === 'Rejected';
  const steps = rejected ? ['Reported', 'Rejected'] : TRACK_STEPS;
  const current = steps.indexOf(status);

  const whenReached = (step) => {
    const entries = history.filter((h) => h.status === step);
    return entries.length ? entries[entries.length - 1].createdAt : null;
  };

  return (
    <ol className="flex flex-col md:flex-row">
      {steps.map((step, i) => {
        const done = i < current || (status === 'Resolved' && i === current);
        const active = i === current && !done;
        const isRejectedStep = rejected && step === 'Rejected';
        const circle = isRejectedStep
          ? 'bg-rose-600 text-white'
          : done
          ? 'bg-emerald-500 text-white'
          : active
          ? 'bg-brand-600 text-white ring-4 ring-brand-100'
          : 'border-2 border-slate-300 bg-white text-slate-400';
        const time = whenReached(step);

        return (
          <li key={step} className="relative flex flex-1 gap-3 pb-6 last:pb-0 md:flex-col md:items-center md:pb-0 md:text-center">
            {i < steps.length - 1 && (
              <span
                className={`absolute left-[15px] top-8 h-full w-0.5 md:left-1/2 md:top-[15px] md:h-0.5 md:w-full ${
                  i < current ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            )}
            <span className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${circle}`}>
              {isRejectedStep ? <X className="h-4 w-4" /> : done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <div className="md:mt-3">
              <p className={`text-sm font-semibold ${done || active || isRejectedStep ? 'text-ink-900' : 'text-slate-400'}`}>
                {statusLabel(step)}
              </p>
              {time && <p className="text-xs text-slate-500">{formatDateTime(time)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
