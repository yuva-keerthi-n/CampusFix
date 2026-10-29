import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Trash2, UserRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import useFetch from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import * as complaintsService from '../services/complaints.service';
import * as adminService from '../services/admin.service';
import { getErrorMessage } from '../services/api';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import StatusTracker from '../components/StatusTracker';
import HistoryTimeline from '../components/HistoryTimeline';
import ImageUpload from '../components/ImageUpload';
import Modal from '../components/Modal';
import Field from '../components/Field';
import { ErrorState, PageLoader } from '../components/States';
import { PRIORITIES, statusLabel } from '../utils/status';
import { formatDate, formatDateTime } from '../utils/format';

function Info({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-800">{children}</dd>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="card p-5 md:p-6">
      <h2 className="mb-4 text-base font-bold text-ink-900">{title}</h2>
      {children}
    </section>
  );
}

// Admin: change priority, update status, assign staff, delete.
function AdminActions({ complaint, onDone }) {
  const toast = useToast();
  const navigate = useNavigate();
  const staff = useFetch(() => adminService.users.list('staff'), []);
  const [priority, setPriority] = useState(complaint.priority);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [staffId, setStaffId] = useState(complaint.assignedTo ? String(complaint.assignedTo) : '');
  const [busy, setBusy] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const run = async (key, action, successMessage) => {
    setBusy(key);
    try {
      await action();
      toast.success(successMessage);
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy('');
    }
  };

  const remove = async () => {
    setBusy('delete');
    try {
      await complaintsService.remove(complaint.id);
      toast.success('Complaint deleted.');
      navigate('/complaints', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setBusy('');
      setConfirmDelete(false);
    }
  };

  const ADMIN_STATUSES = ['Under_Review', 'In_Progress', 'Resolved', 'Rejected'];

  return (
    <Section title="Admin actions">
      <div className="space-y-6">
        <div>
          <Field label="Assign to staff">
            <select className="input" value={staffId} onChange={(e) => setStaffId(e.target.value)}>
              <option value="">{staff.loading ? 'Loading staff…' : 'Select staff member'}</option>
              {(staff.data || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <button
            className="btn btn-primary btn-sm mt-3 w-full"
            disabled={!staffId || busy === 'assign'}
            onClick={() => run('assign', () => complaintsService.assign(complaint.id, Number(staffId)), 'Complaint assigned.')}
          >
            {busy === 'assign' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {complaint.assignee ? 'Reassign' : 'Assign'}
          </button>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <Field label="Update status">
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Select new status</option>
              {ADMIN_STATUSES.filter((s) => s !== complaint.status).map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </Field>
          <input
            className="input mt-3"
            placeholder="Note (optional) — e.g. reason for rejection"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            className="btn btn-dark btn-sm mt-3 w-full"
            disabled={!status || busy === 'status'}
            onClick={() =>
              run('status', () => complaintsService.updateStatus(complaint.id, status, note.trim() || undefined), 'Status updated.').then(() => {
                setStatus('');
                setNote('');
              })
            }
          >
            {busy === 'status' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Update status
          </button>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <Field label="Priority">
            <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <button
            className="btn btn-secondary btn-sm mt-3 w-full"
            disabled={priority === complaint.priority || busy === 'priority'}
            onClick={() => run('priority', () => complaintsService.update(complaint.id, { priority }), 'Priority updated.')}
          >
            {busy === 'priority' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save priority
          </button>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <button className="btn btn-ghost btn-sm w-full text-red-600 hover:bg-red-50" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" /> Delete complaint
          </button>
        </div>
      </div>

      <Modal open={confirmDelete} title="Delete this complaint?" onClose={() => setConfirmDelete(false)}>
        <p className="text-sm text-slate-600">
          {complaint.complaintCode} and its history will be permanently removed. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </button>
          <button className="btn btn-danger" disabled={busy === 'delete'} onClick={remove}>
            {busy === 'delete' && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </Modal>
    </Section>
  );
}

// Staff: start work, then resolve with notes and an optional photo.
function StaffActions({ complaint, onDone }) {
  const toast = useToast();
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState(null);
  const [notesError, setNotesError] = useState('');
  const [busy, setBusy] = useState('');

  const startWork = async () => {
    setBusy('start');
    try {
      await complaintsService.updateStatus(complaint.id, 'In_Progress', note.trim() || 'Work started.');
      toast.success('Marked as in progress.');
      setNote('');
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy('');
    }
  };

  const resolve = async (e) => {
    e.preventDefault();
    if (notes.trim().length < 5) {
      setNotesError('Add resolution notes (at least 5 characters) describing what was done.');
      return;
    }
    setNotesError('');
    const body = new FormData();
    body.append('notes', notes.trim());
    if (image) body.append('image', image);

    setBusy('resolve');
    try {
      await complaintsService.resolve(complaint.id, body);
      toast.success('Complaint marked as resolved.');
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy('');
    }
  };

  return (
    <Section title="Your work on this complaint">
      <div className="space-y-6">
        {complaint.status === 'Assigned' && (
          <div>
            <Field label="Start work" hint="Let the reporter know you've picked this up.">
              <input className="input" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <button className="btn btn-dark btn-sm mt-3 w-full" disabled={busy === 'start'} onClick={startWork}>
              {busy === 'start' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Mark as In Progress
            </button>
          </div>
        )}

        <form onSubmit={resolve} noValidate className={complaint.status === 'Assigned' ? 'border-t border-slate-100 pt-6' : ''}>
          <div className="space-y-4">
            <Field label="Resolution notes" required error={notesError}>
              <textarea
                rows={3}
                className={`input resize-y ${notesError ? 'input-error' : ''}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What was the problem and what did you do to fix it?"
              />
            </Field>
            <Field label="Resolution photo (optional)">
              <ImageUpload file={image} onChange={setImage} />
            </Field>
            <button type="submit" className="btn btn-primary w-full" disabled={busy === 'resolve'}>
              {busy === 'resolve' && <Loader2 className="h-4 w-4 animate-spin" />}
              Mark as Resolved
            </button>
          </div>
        </form>
      </div>
    </Section>
  );
}

export default function ComplaintDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: c, loading, error, reload } = useFetch(() => complaintsService.get(id), [id]);
  const [zoom, setZoom] = useState(null);

  if (loading && !c) return <PageLoader text="Loading complaint…" />;
  if (error && !c) {
    return (
      <div className="space-y-4">
        <Link to="/complaints" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to complaints
        </Link>
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }
  if (!c) return null;

  const isAssignedStaff = user.role === 'staff' && c.assignedTo === user.id;
  const staffCanAct = isAssignedStaff && c.status !== 'Resolved' && c.status !== 'Rejected';
  const rejection = [...c.history].reverse().find((h) => h.status === 'Rejected');

  return (
    <div className="space-y-6">
      <Link to="/complaints" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to complaints
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span className="rounded-md bg-ink-900 px-2 py-1 font-mono text-xs font-semibold text-white">{c.complaintCode}</span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900">{c.title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <PriorityBadge priority={c.priority} />
          <StatusBadge status={c.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Status progress">
            <StatusTracker status={c.status} history={c.history} />
            {c.status === 'Rejected' && rejection?.note && (
              <p className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                <span className="font-semibold">Reason: </span>
                {rejection.note}
              </p>
            )}
          </Section>

          <Section title="Complaint information">
            <p className="mb-5 whitespace-pre-line text-sm leading-relaxed text-slate-700">{c.description}</p>
            <dl className="grid grid-cols-2 gap-5 border-t border-slate-100 pt-5 sm:grid-cols-3">
              <Info label="Category">{c.category?.name}</Info>
              <Info label="Location">{c.location?.name}</Info>
              <Info label="Priority">{c.priority}</Info>
              <Info label="Reported on">{formatDateTime(c.createdAt)}</Info>
              <Info label="Reported by">{c.reporter?.name}</Info>
              <Info label="Last updated">{formatDate(c.updatedAt)}</Info>
            </dl>
          </Section>

          {c.imageUrl && (
            <Section title="Issue photo">
              <button onClick={() => setZoom(c.imageUrl)} className="block w-full overflow-hidden rounded-xl bg-slate-100" aria-label="View larger">
                <img src={c.imageUrl} alt="Reported issue" className="max-h-96 w-full object-contain" />
              </button>
            </Section>
          )}

          {c.resolution && (
            <Section title="Resolution">
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{c.resolution.notes || 'No notes added.'}</p>
              <p className="mt-3 text-xs text-slate-500">Resolved on {formatDateTime(c.resolution.resolvedAt)}</p>
              {c.resolution.imageUrl && (
                <button onClick={() => setZoom(c.resolution.imageUrl)} className="mt-4 block w-full overflow-hidden rounded-xl bg-slate-100" aria-label="View larger">
                  <img src={c.resolution.imageUrl} alt="Resolution" className="max-h-80 w-full object-contain" />
                </button>
              )}
            </Section>
          )}

          <Section title="Complaint history">
            <HistoryTimeline history={c.history} />
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Assignment">
            {c.assignee ? (
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-violet-100 text-violet-700">
                  <UserRound className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">{c.assignee.name}</p>
                  <p className="truncate text-xs text-slate-500">{c.assignee.email}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">Department: Maintenance</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Not assigned to anyone yet.</p>
            )}
          </Section>

          {user.role === 'admin' && <AdminActions key={c.updatedAt} complaint={c} onDone={reload} />}
          {staffCanAct && <StaffActions key={c.updatedAt} complaint={c} onDone={reload} />}
        </div>
      </div>

      <Modal open={Boolean(zoom)} title="Photo" onClose={() => setZoom(null)} size="lg">
        {zoom && <img src={zoom} alt="Full size" className="max-h-[70vh] w-full rounded-lg object-contain" />}
      </Modal>
    </div>
  );
}
