import { Link } from 'react-router-dom';
import { CheckCircle2, ClipboardList, ListTodo, PartyPopper, Wrench } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import useFetch from '../hooks/useFetch';
import * as dashboardService from '../services/dashboard.service';
import * as complaintsService from '../services/complaints.service';
import StatCard from '../components/StatCard';
import ComplaintCard from '../components/ComplaintCard';
import { EmptyState, ErrorState, PageLoader } from '../components/States';
import { firstName } from '../utils/format';

export default function StaffDashboard() {
  const { user } = useAuth();
  const stats = useFetch(() => dashboardService.stats(), []);
  const tasks = useFetch(() => complaintsService.list(), []);

  // Work that still needs action: newly assigned first, then in progress.
  const open = (tasks.data || [])
    .filter((c) => c.status === 'Assigned' || c.status === 'In_Progress')
    .sort((a, b) => (a.status === b.status ? 0 : a.status === 'Assigned' ? -1 : 1));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Hi, {firstName(user.name)}</h1>
        <p className="mt-1 text-slate-500">Your assigned workload at a glance.</p>
      </div>

      {stats.loading && !stats.data ? (
        <PageLoader text="Loading your workload…" />
      ) : stats.error ? (
        <ErrorState message={stats.error} onRetry={stats.reload} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Assigned Complaints" value={stats.data.total} icon={ClipboardList} tone="slate" />
          <StatCard label="Pending Tasks" value={stats.data.assigned} icon={ListTodo} tone="violet" hint="Not started yet" />
          <StatCard label="In Progress" value={stats.data.inProgress} icon={Wrench} tone="sky" />
          <StatCard label="Resolved" value={stats.data.resolved} icon={CheckCircle2} tone="emerald" />
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">Needs your attention</h2>
          <Link to="/complaints" className="text-sm font-semibold text-brand-700 hover:underline">
            All my tasks
          </Link>
        </div>
        {tasks.loading && !tasks.data ? (
          <PageLoader text="Loading tasks…" />
        ) : tasks.error ? (
          <ErrorState message={tasks.error} onRetry={tasks.reload} />
        ) : open.length === 0 ? (
          <EmptyState icon={PartyPopper} title="Nothing waiting on you" text="New assignments from the admin will show up here." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {open.map((c) => (
              <ComplaintCard key={c.id} complaint={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
