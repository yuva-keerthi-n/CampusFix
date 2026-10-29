import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Field from '../components/Field';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../services/api';

// Quick-fill buttons for the seeded demo accounts (documented in the README).
const DEMO = [
  { label: 'Student', email: 'student1@campusfix.edu' },
  { label: 'Staff', email: 'staff@campusfix.edu' },
  { label: 'Admin', email: 'admin@campusfix.edu' },
];

export default function Login() {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (user) return <Navigate to="/dashboard" replace />;

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.email.trim()) next.email = 'Enter your email address.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (!form.password) next.password = 'Enter your password.';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const loggedIn = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${loggedIn.name.split(' ')[0]}!`);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not log in. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to report and track campus issues.">
      <form onSubmit={submit} className="space-y-5" noValidate>
        {formError && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            value={form.email}
            onChange={onChange('email')}
            placeholder="you@college.edu"
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <input
            type="password"
            autoComplete="current-password"
            className={`input ${errors.password ? 'input-error' : ''}`}
            value={form.password}
            onChange={onChange('password')}
            placeholder="••••••••"
          />
        </Field>
        <button type="submit" disabled={submitting} className="btn btn-primary w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Demo accounts</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DEMO.map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={() => setForm({ email: d.email, password: 'Demo@123' })}
              className="btn btn-secondary btn-sm"
            >
              Fill {d.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">Password for all demo accounts: Demo@123</p>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        New here?{' '}
        <Link to="/register" className="font-semibold text-brand-700 hover:underline">
          Create a student account
        </Link>
      </p>
    </AuthLayout>
  );
}
