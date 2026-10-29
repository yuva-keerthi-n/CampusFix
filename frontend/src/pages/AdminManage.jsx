import { useState } from 'react';
import { Loader2, MapPin, Pencil, Plus, Tag, Trash2, Users } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import * as adminService from '../services/admin.service';
import { getErrorMessage } from '../services/api';
import Modal from '../components/Modal';
import Field from '../components/Field';
import { EmptyState, ErrorState, PageLoader } from '../components/States';
import { formatDate } from '../utils/format';

// Add / rename / delete for a simple list of names (used for categories and locations).
function NameManager({ noun, service }) {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => service.list(), [service]);
  const [editing, setEditing] = useState(null); // null = closed, {} = adding, {id,name} = editing
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => {
    setEditing({});
    setName('');
    setNameError('');
  };
  const openEdit = (item) => {
    setEditing(item);
    setName(item.name);
    setNameError('');
  };

  const save = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(`Enter a ${noun} name.`);
      return;
    }
    setSaving(true);
    try {
      if (editing.id) await service.update(editing.id, name.trim());
      else await service.create(name.trim());
      toast.success(editing.id ? `${noun} updated.` : `${noun} added.`);
      setEditing(null);
      reload();
    } catch (err) {
      setNameError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await service.remove(toDelete.id);
      toast.success(`${noun} deleted.`);
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">{data ? `${data.length} ${noun}${data.length === 1 ? '' : 's'}` : ' '}</p>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add {noun}
        </button>
      </div>

      {loading && !data ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <EmptyState title={`No ${noun}s yet`} text={`Add your first ${noun} so users can pick it when reporting.`} />
      ) : (
        <ul className="card divide-y divide-slate-100 overflow-hidden">
          {data.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="truncate text-sm font-medium text-slate-800">{item.name}</span>
              <span className="flex shrink-0 gap-1">
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)} aria-label={`Edit ${item.name}`}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50" onClick={() => setToDelete(item)} aria-label={`Delete ${item.name}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <Modal open={Boolean(editing)} title={editing?.id ? `Edit ${noun}` : `Add ${noun}`} onClose={() => setEditing(null)}>
        <form onSubmit={save} noValidate className="space-y-5">
          <Field label="Name" error={nameError}>
            <input autoFocus className={`input ${nameError ? 'input-error' : ''}`} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(toDelete)} title={`Delete ${noun}?`} onClose={() => setToDelete(null)}>
        <p className="text-sm text-slate-600">
          "{toDelete?.name}" will be removed. If existing complaints still use it, the system will not allow deleting it.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn btn-secondary" onClick={() => setToDelete(null)}>
            Cancel
          </button>
          <button className="btn btn-danger" disabled={deleting} onClick={confirmDelete}>
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

const ROLE_STYLE = {
  admin: 'bg-ink-900 text-white',
  staff: 'bg-violet-100 text-violet-700',
  student: 'bg-slate-100 text-slate-700',
};

function UsersList() {
  const { data, loading, error, reload } = useFetch(() => adminService.users.list(), []);
  if (loading && !data) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${ROLE_STYLE[u.role]}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TABS = [
  { key: 'categories', label: 'Categories', icon: Tag },
  { key: 'locations', label: 'Locations', icon: MapPin },
  { key: 'users', label: 'Users & staff', icon: Users },
];

export default function AdminManage() {
  const [tab, setTab] = useState('categories');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Manage</h1>
        <p className="mt-1 text-slate-500">Control the categories and locations people can choose, and see who has an account.</p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-200/60 p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === key ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-600 hover:text-ink-900'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'categories' && <NameManager key="categories" noun="category" service={adminService.categories} />}
      {tab === 'locations' && <NameManager key="locations" noun="location" service={adminService.locations} />}
      {tab === 'users' && <UsersList />}
    </div>
  );
}
