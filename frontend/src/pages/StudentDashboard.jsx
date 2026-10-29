import { Link } from 'react-router-dom';
import { Ban, CheckCircle2, ClipboardList, Hourglass, Inbox, Wrench } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import useFetch from '../hooks/useFetch';
import * as dashboardService from '../services/dashboard.service';
import * as complaintsService from '../services/complaints.service';
import StatCard from '../components/StatCard';
import ComplaintCard from '../components/ComplaintCard';
import { EmptyState, ErrorState, PageLoader } from '../components/States';
import { firstName } from '../utils/format';

export default function StudentDashboard() {
  const { user } = useAuth();
  const stats = useFetch(() => dashboardService.stats(), []);
  const recent = useFetch(() => complaintsService.list(), []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Hi, {firstName(user.name)} 👋</h1>
          <p className="mt-1 text-slate-500">Here's where your reported issues stand.</p>
        </div>
        <Link to="/report" className="btn btn-primary px-6 py-3 text-base">
          + Report an Issue
        </Link>
      </div>

      {stats.loading && !stats.data ? (
        <PageLoader text="Loading your stats…" />
      ) : stats.error ? (
        <ErrorState message={stats.error} onRetry={stats.reload} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total Complaints" value={stats.data.total} icon={ClipboardList} tone="slate" />
          <StatCard
            label="Reported"
            value={stats.data.byStatus.Reported + stats.data.byStatus.Under_Review}
            icon={Hourglass}
            tone="amber"
            hint="Awaiting review"
          />
          <StatCard
            label="In Progress"
            value={stats.data.byStatus.Assigned + stats.data.byStatus.In_Progress}
            icon={Wrench}
            tone="sky"
            hint="Assigned or being fixed"
          />
          <StatCard label="Resolved" value={stats.data.resolved} icon={CheckCircle2} tone="emerald" />
          <StatCard label="Rejected" value={stats.data.rejected} icon={Ban} tone="red" />
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">Recent complaints</h2>
          <Link to="/complaints" className="text-sm font-semibold text-brand-700 hover:underline">
            View all
          </Link>
        </div>
        {recent.loading && !recent.data ? (
          <PageLoader text="Loading complaints…" />
        ) : recent.error ? (
          <ErrorState message={recent.error} onRetry={recent.reload} />
        ) : recent.data.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="You haven't reported anything yet"
            text="Spotted a broken fan, a leak or a Wi-Fi problem? Let the maintenance team know."
            action={
              <Link to="/report" className="btn btn-primary">
                + Report your first issue
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recent.data.slice(0, 6).map((c) => (
              <ComplaintCard key={c.id} complaint={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
