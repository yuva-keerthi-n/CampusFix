import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Field from '../components/Field';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../services/api';

export default function Register() {
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (user) return <Navigate to="/dashboard" replace />;

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Enter your full name.';
    if (!form.email.trim()) next.email = 'Enter your email address.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (!form.password) next.password = 'Choose a password.';
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters.';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      toast.success('Account created. Welcome to CampusFix!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not create your account. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Students can sign up here and start reporting right away.">
      <form onSubmit={submit} className="space-y-5" noValidate>
        {formError && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}
        <Field label="Full name" error={errors.name}>
          <input className={`input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={onChange('name')} placeholder="Asha Rao" />
        </Field>
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
        <Field label="Password" error={errors.password} hint="At least 6 characters.">
          <input
            type="password"
            autoComplete="new-password"
            className={`input ${errors.password ? 'input-error' : ''}`}
            value={form.password}
            onChange={onChange('password')}
          />
        </Field>
        <Field label="Role" hint="Staff and admin accounts are created by the college administrator, not through sign-up.">
          <input className="input" value="Student" disabled readOnly />
        </Field>
        <button type="submit" disabled={submitting} className="btn btn-primary w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
