import { STATUS_STYLES, statusLabel } from '../utils/status';
import { formatDateTime } from '../utils/format';

// Every status change recorded in complaint_history, oldest first.
export default function HistoryTimeline({ history = [] }) {
  if (!history.length) return <p className="text-sm text-slate-400">No history recorded yet.</p>;

  return (
    <ol className="relative ml-2 border-l-2 border-slate-200">
      {history.map((h) => (
        <li key={h.id} className="relative pb-6 pl-6 last:pb-0">
          <span
            className={`absolute -left-[7px] top-1.5 h-3 w-3 rounded-full ring-4 ring-white ${
              STATUS_STYLES[h.status]?.dot || 'bg-slate-400'
            }`}
          />
          <p className="text-xs font-medium text-slate-500">{formatDateTime(h.createdAt)}</p>
          <p className="mt-0.5 text-sm font-semibold text-ink-900">{statusLabel(h.status)}</p>
          {h.note && <p className="mt-0.5 text-sm text-slate-600">{h.note}</p>}
          {h.user && (
            <p className="mt-0.5 text-xs text-slate-400">
              by {h.user.name} ({h.user.role})
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
