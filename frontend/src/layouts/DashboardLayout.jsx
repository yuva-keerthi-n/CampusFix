import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Search,
  Settings2,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import NotificationBell from '../components/NotificationBell';
import { initials } from '../utils/format';

const NAV = {
  student: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/report', label: 'Report an Issue', icon: PlusCircle },
    { to: '/complaints', label: 'My Complaints', icon: ClipboardList },
  ],
  staff: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/complaints', label: 'My Tasks', icon: ClipboardList },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/complaints', label: 'All Complaints', icon: ClipboardList },
    { to: '/manage', label: 'Manage', icon: Settings2 },
  ],
};

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col bg-ink-900 text-slate-300">
      <div className="px-5 py-5">
        <Logo light />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV[user.role].map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-white/10 text-white shadow-[inset_3px_0_0_0_#f2622a]' : 'hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
            {initials(user.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="text-xs capitalize text-slate-400">{user.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn w-full justify-start bg-white/5 text-slate-200 hover:bg-white/10">
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Close the mobile menu whenever the page changes.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/complaints?search=${encodeURIComponent(q)}` : '/complaints');
  };

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/60" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] shadow-2xl">
            <SidebarContent onNavigate={() => setMenuOpen(false)} />
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-lg text-slate-300 hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-canvas/90 px-4 py-3 backdrop-blur md:px-8">
          <button
            onClick={() => setMenuOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-200/60 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <form onSubmit={submitSearch} className="relative min-w-0 flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input bg-white pl-9"
              placeholder="Search complaints…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search complaints"
            />
          </form>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
