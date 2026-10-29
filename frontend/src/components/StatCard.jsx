const TONES = {
  slate: 'bg-slate-100 text-slate-600',
  brand: 'bg-brand-100 text-brand-700',
  sky: 'bg-sky-100 text-sky-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
  violet: 'bg-violet-100 text-violet-700',
};

export default function StatCard({ label, value, icon: Icon, tone = 'slate', hint }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${TONES[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold leading-none tracking-tight text-ink-900">{value ?? 0}</p>
        <p className="mt-1.5 truncate text-sm font-medium text-slate-600">{label}</p>
        {hint && <p className="truncate text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
