import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to log in');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">MarkMyDay</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Sign in</h1>
        <label className="mt-6 block text-sm font-medium text-slate-700">
          Email
          <input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </label>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <button className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={submitting} type="submit">
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account? <Link className="font-semibold text-indigo-600 underline" to="/register">Register here</Link>
        </p>
      </form>
    </main>
  );
}
