import { STATUSES, STATUS_STYLES, statusLabel } from '../utils/status';

// Horizontal bars: one row per item, width relative to the biggest value.
export function BarList({ items = [], barClass = 'bg-brand-500' }) {
  if (!items.length) {
    return <p className="py-6 text-center text-sm text-slate-400">No data yet.</p>;
  }
  const sorted = [...items].sort((a, b) => b.count - a.count);
  const max = Math.max(...sorted.map((i) => i.count), 1);
  return (
    <ul className="space-y-3">
      {sorted.map((item) => (
        <li key={item.name}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="truncate font-medium text-slate-700">{item.name}</span>
            <span className="ml-3 font-semibold tabular-nums text-ink-900">{item.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${barClass}`} style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// One stacked bar split by status, with a legend underneath.
export function StatusBar({ byStatus = {} }) {
  const total = STATUSES.reduce((sum, s) => sum + (byStatus[s] || 0), 0);
  if (!total) {
    return <p className="py-6 text-center text-sm text-slate-400">No complaints yet.</p>;
  }
  return (
    <div>
      <div className="flex h-4 overflow-hidden rounded-full bg-slate-100">
        {STATUSES.filter((s) => byStatus[s]).map((s) => (
          <div
            key={s}
            className={STATUS_STYLES[s].dot}
            style={{ width: `${(byStatus[s] / total) * 100}%` }}
            title={`${statusLabel(s)}: ${byStatus[s]}`}
          />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {STATUSES.map((s) => (
          <li key={s} className="flex items-center gap-2 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLES[s].dot}`} />
            <span className="text-slate-600">{statusLabel(s)}</span>
            <span className="ml-auto font-semibold tabular-nums text-ink-900">{byStatus[s] || 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
