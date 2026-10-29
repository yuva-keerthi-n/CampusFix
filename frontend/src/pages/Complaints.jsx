import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ComplaintsManager from '../components/ComplaintsManager';

const COPY = {
  student: { title: 'My complaints', text: 'Everything you have reported, newest first.' },
  staff: { title: 'My tasks', text: 'Complaints assigned to you.' },
  admin: { title: 'All complaints', text: 'Search, filter and manage every complaint.' },
};

export default function Complaints() {
  const { user } = useAuth();
  const copy = COPY[user.role];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{copy.title}</h1>
          <p className="mt-1 text-slate-500">{copy.text}</p>
        </div>
        {user.role === 'student' && (
          <Link to="/report" className="btn btn-primary">
            + Report an Issue
          </Link>
        )}
      </div>
      <ComplaintsManager />
    </div>
  );
}
