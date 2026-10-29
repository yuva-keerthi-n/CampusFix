import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Tag } from 'lucide-react';
import { PriorityBadge, StatusBadge } from './StatusBadge';
import { formatDate } from '../utils/format';

export default function ComplaintCard({ complaint }) {
  return (
    <Link
      to={`/complaints/${complaint.id}`}
      className="card block p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-md bg-ink-900 px-2 py-1 font-mono text-xs font-semibold text-white">
          {complaint.complaintCode}
        </span>
        <StatusBadge status={complaint.status} />
      </div>
      <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug text-ink-900">{complaint.title}</h3>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5" /> {complaint.category?.name}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> {complaint.location?.name}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <PriorityBadge priority={complaint.priority} />
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays className="h-3.5 w-3.5" /> {formatDate(complaint.createdAt)}
        </span>
      </div>
    </Link>
  );
}
