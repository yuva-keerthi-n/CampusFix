// The API uses underscores in enum values (Under_Review). These helpers turn them into display text.
export const STATUSES = ['Reported', 'Under_Review', 'Assigned', 'In_Progress', 'Resolved', 'Rejected'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const TRACK_STEPS = ['Reported', 'Under_Review', 'Assigned', 'In_Progress', 'Resolved'];

export const statusLabel = (status) => (status || '').replace(/_/g, ' ');

export const STATUS_STYLES = {
  Reported: { badge: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-500' },
  Under_Review: { badge: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-500' },
  Assigned: { badge: 'bg-violet-50 text-violet-700 ring-violet-200', dot: 'bg-violet-500' },
  In_Progress: { badge: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500' },
  Resolved: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  Rejected: { badge: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500' },
};

export const PRIORITY_STYLES = {
  Low: 'bg-slate-100 text-slate-600 ring-slate-200',
  Medium: 'bg-amber-50 text-amber-800 ring-amber-200',
  High: 'bg-orange-100 text-orange-800 ring-orange-200',
  Critical: 'bg-red-600 text-white ring-red-700',
};
