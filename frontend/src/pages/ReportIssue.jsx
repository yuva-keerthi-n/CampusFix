import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import * as complaintsService from '../services/complaints.service';
import * as adminService from '../services/admin.service';
import { getErrorMessage } from '../services/api';
import Field from '../components/Field';
import ImageUpload from '../components/ImageUpload';
import { ErrorState, PageLoader } from '../components/States';
import { PRIORITIES } from '../utils/status';

const INITIAL = { title: '', categoryId: '', locationId: '', description: '', priority: 'Medium' };

const PRIORITY_HINT = {
  Low: 'Minor, can wait',
  Medium: 'Needs fixing soon',
  High: 'Affects many people',
  Critical: 'Safety risk or urgent',
};

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Please enter a short title.';
  else if (form.title.trim().length < 5) errors.title = 'Title should be at least 5 characters.';
  if (!form.categoryId) errors.categoryId = 'Select a category.';
  if (!form.locationId) errors.locationId = 'Select where the problem is.';
  if (!form.description.trim()) errors.description = 'Describe the problem.';
  else if (form.description.trim().length < 10) errors.description = 'Add a little more detail (at least 10 characters).';
  if (!form.priority) errors.priority = 'Select a priority.';
  return errors;
}

export default function ReportIssue() {
  const toast = useToast();
  const options = useFetch(async () => {
    const [categories, locations] = await Promise.all([adminService.categories.list(), adminService.locations.list()]);
    return { categories, locations };
  }, []);

  const [form, setForm] = useState(INITIAL);
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [created, setCreated] = useState(null);

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    const body = new FormData();
    body.append('title', form.title.trim());
    body.append('categoryId', form.categoryId);
    body.append('locationId', form.locationId);
    body.append('description', form.description.trim());
    body.append('priority', form.priority);
    if (image) body.append('image', image);

    setSubmitting(true);
    try {
      const complaint = await complaintsService.create(body);
      setCreated(complaint);
      toast.success('Complaint submitted successfully.');
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not submit your complaint.'));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm(INITIAL);
    setImage(null);
    setErrors({});
    setCreated(null);
  };

  if (created) {
    return (
      <div className="mx-auto max-w-lg py-8 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink-900">Complaint submitted</h1>
        <p className="mt-2 text-slate-500">Keep this ID to follow your complaint. The admin team will review it shortly.</p>
        <p className="mx-auto mt-6 inline-block rounded-xl bg-ink-900 px-6 py-3 font-mono text-2xl font-bold tracking-wider text-white">
          {created.complaintCode}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to={`/complaints/${created.id}`} className="btn btn-primary">
            View complaint
          </Link>
          <button onClick={reset} className="btn btn-secondary">
            Report another issue
          </button>
          <Link to="/dashboard" className="btn btn-ghost">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (options.loading && !options.data) return <PageLoader text="Preparing the form…" />;
  if (options.error) return <ErrorState message={options.error} onRetry={options.reload} />;

  const { categories, locations } = options.data;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Report an issue</h1>
      <p className="mb-6 mt-1 text-slate-500">Tell us what is wrong and where. The more detail, the faster it gets fixed.</p>

      <form onSubmit={submit} noValidate className="card space-y-6 p-6 md:p-8">
        {formError && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <Field label="Issue title" required error={errors.title}>
          <input
            className={`input ${errors.title ? 'input-error' : ''}`}
            value={form.title}
            onChange={onChange('title')}
            placeholder="e.g. Ceiling fan not working in Room 204"
            maxLength={150}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Category" required error={errors.categoryId}>
            <select className={`input ${errors.categoryId ? 'input-error' : ''}`} value={form.categoryId} onChange={onChange('categoryId')}>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Location" required error={errors.locationId}>
            <select className={`input ${errors.locationId ? 'input-error' : ''}`} value={form.locationId} onChange={onChange('locationId')}>
              <option value="">Select a location</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Description" required error={errors.description}>
          <textarea
            rows={4}
            className={`input resize-y ${errors.description ? 'input-error' : ''}`}
            value={form.description}
            onChange={onChange('description')}
            placeholder="What exactly is wrong? Mention the room number, since when, and anything else that helps."
          />
        </Field>

        <Field label="Priority" required error={errors.priority}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PRIORITIES.map((p) => (
              <label
                key={p}
                className={`cursor-pointer rounded-xl border-2 p-3 text-center transition ${
                  form.priority === p ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input type="radio" name="priority" value={p} checked={form.priority === p} onChange={onChange('priority')} className="sr-only" />
                <span className="block text-sm font-bold text-ink-900">{p}</span>
                <span className="mt-0.5 block text-[11px] leading-tight text-slate-500">{PRIORITY_HINT[p]}</span>
              </label>
            ))}
          </div>
        </Field>

        <Field label="Photo (optional)">
          <ImageUpload file={image} onChange={setImage} />
        </Field>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <Link to="/dashboard" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={submitting} className="btn btn-primary px-6">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Submitting…' : 'Submit complaint'}
          </button>
        </div>
      </form>
    </div>
  );
}
