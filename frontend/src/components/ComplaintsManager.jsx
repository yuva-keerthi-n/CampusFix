import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ClipboardList, Search, SearchX } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import useFetch from '../hooks/useFetch';
import * as complaintsService from '../services/complaints.service';
import * as adminService from '../services/admin.service';
import { PRIORITIES, STATUSES, statusLabel } from '../utils/status';
import ComplaintCard from './ComplaintCard';
import ComplaintsTable from './ComplaintsTable';
import { EmptyState, ErrorState, PageLoader } from './States';

const EMPTY_FILTERS = { status: '', category: '', priority: '', location: '', dateFrom: '', dateTo: '' };

// Search + filters + results. Admin gets the full filter set and a table;
// staff get a table too; students get simple cards.
export default function ComplaintsManager() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const useTable = user.role !== 'student';

  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(urlSearch);
  const [debounced, setDebounced] = useState(urlSearch);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  // The top-bar global search sets ?search=… in the URL.
  useEffect(() => setSearch(urlSearch), [urlSearch]);

  // Wait 300ms after typing stops before asking the server.
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const params = useMemo(() => {
    const p = {};
    if (debounced) p.search = debounced;
    ['status', 'category', 'priority', 'location'].forEach((key) => {
      if (filters[key]) p[key] = filters[key];
    });
    if (filters.dateFrom) p.dateFrom = `${filters.dateFrom}T00:00:00`;
    if (filters.dateTo) p.dateTo = `${filters.dateTo}T23:59:59`;
    return p;
  }, [debounced, filters]);

  const { data: complaints, loading, error, reload } = useFetch(
    () => complaintsService.list(params),
    [JSON.stringify(params)]
  );
  const { data: categories } = useFetch(() => (isAdmin ? adminService.categories.list() : Promise.resolve([])), [isAdmin]);
  const { data: locations } = useFetch(() => (isAdmin ? adminService.locations.list() : Promise.resolve([])), [isAdmin]);

  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));
  const filtersActive = Boolean(search) || Object.values(filters).some(Boolean);
  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
    setSearch('');
  };

  return (
    <div className="space-y-4">
      <div className="card space-y-3 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search by ID, title, category or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input sm:w-48" value={filters.status} onChange={setFilter('status')} aria-label="Filter by status">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </div>

        {isAdmin && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select className="input" value={filters.category} onChange={setFilter('category')} aria-label="Filter by category">
              <option value="">All categories</option>
              {(categories || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select className="input" value={filters.priority} onChange={setFilter('priority')} aria-label="Filter by priority">
              <option value="">All priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select className="input" value={filters.location} onChange={setFilter('location')} aria-label="Filter by location">
              <option value="">All locations</option>
              {(locations || []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <input type="date" className="input" value={filters.dateFrom} onChange={setFilter('dateFrom')} aria-label="From date" />
              <span className="text-xs text-slate-400">to</span>
              <input type="date" className="input" value={filters.dateTo} onChange={setFilter('dateTo')} aria-label="To date" />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{complaints ? `${complaints.length} complaint${complaints.length === 1 ? '' : 's'}` : ' '}</span>
          {filtersActive && (
            <button onClick={clearAll} className="font-semibold text-brand-700 hover:underline">
              Clear search &amp; filters
            </button>
          )}
        </div>
      </div>

      {loading && !complaints ? (
        <PageLoader text="Loading complaints…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : complaints.length === 0 ? (
        filtersActive ? (
          <EmptyState
            icon={SearchX}
            title="No complaints match"
            text="Try a different search term or clear the filters."
            action={
              <button onClick={clearAll} className="btn btn-secondary btn-sm">
                Clear search &amp; filters
              </button>
            }
          />
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No complaints yet"
            text={user.role === 'student' ? 'When you report an issue it will show up here.' : 'Nothing to show here yet.'}
            action={
              user.role === 'student' && (
                <Link to="/report" className="btn btn-primary">
                  + Report an Issue
                </Link>
              )
            }
          />
        )
      ) : useTable ? (
        <>
          <div className="hidden md:block">
            <ComplaintsTable complaints={complaints} />
          </div>
          <div className="grid gap-3 md:hidden">
            {complaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} />
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {complaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      )}
    </div>
  );
}
