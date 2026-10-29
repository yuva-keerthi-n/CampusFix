import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PriorityBadge, StatusBadge } from './StatusBadge';
import { formatDate } from '../utils/format';

const HEADERS = [
  'Complaint ID',
  'Title',
  'Category',
  'Location',
  'Priority',
  'Status',
  'Reported By',
  'Assigned To',
  'Date',
  'Actions',
];

export default function ComplaintsTable({ complaints }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {HEADERS.map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-ink-900">
                  {c.complaintCode}
                </td>
                <td className="max-w-[240px] truncate px-4 py-3 font-medium text-slate-800">{c.title}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{c.category?.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{c.location?.name}</td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={c.priority} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{c.reporter?.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {c.assignee?.name || <span className="text-slate-400">Unassigned</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(c.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/complaints/${c.id}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
                  >
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
