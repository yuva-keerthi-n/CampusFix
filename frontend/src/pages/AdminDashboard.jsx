import { AlertTriangle, CheckCircle2, ClipboardList, Hourglass, Wrench } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import * as dashboardService from '../services/dashboard.service';
import StatCard from '../components/StatCard';
import ComplaintsManager from '../components/ComplaintsManager';
import { BarList, StatusBar } from '../components/Charts';
import { ErrorState, PageLoader } from '../components/States';

export default function AdminDashboard() {
  const { data, loading, error, reload } = useFetch(() => dashboardService.stats(), []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Admin dashboard</h1>
        <p className="mt-1 text-slate-500">Everything reported across campus, in one place.</p>
      </div>

      {loading && !data ? (
        <PageLoader text="Loading statistics…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total Complaints" value={data.total} icon={ClipboardList} tone="slate" />
            <StatCard label="Pending Complaints" value={data.pending} icon={Hourglass} tone="amber" hint="Reported or under review" />
            <StatCard label="In Progress" value={data.inProgress} icon={Wrench} tone="sky" />
            <StatCard label="Resolved" value={data.resolved} icon={CheckCircle2} tone="emerald" />
            <StatCard label="Critical Issues" value={data.critical} icon={AlertTriangle} tone="red" hint="Still open" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="card p-5 lg:col-span-3">
              <h2 className="mb-4 text-base font-bold text-ink-900">Complaints by status</h2>
              <StatusBar byStatus={data.byStatus} />
            </div>
            <div className="card p-5 lg:col-span-1">
              <h2 className="mb-4 text-base font-bold text-ink-900">By category</h2>
              <BarList items={data.byCategory} barClass="bg-brand-500" />
            </div>
            <div className="card p-5 lg:col-span-2">
              <h2 className="mb-4 text-base font-bold text-ink-900">By location</h2>
              <BarList items={data.byLocation} barClass="bg-ink-700" />
            </div>
          </div>
        </>
      )}

      <section>
        <h2 className="mb-4 text-lg font-bold text-ink-900">All complaints</h2>
        <ComplaintsManager />
      </section>
    </div>
  );
}
