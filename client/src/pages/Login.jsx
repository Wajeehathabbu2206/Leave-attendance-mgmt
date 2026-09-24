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
    <main className="flex min-h-screen items-center justify-center bg-[#F2F7FB] px-6 py-10">
      <section className="grid w-full max-w-4xl overflow-hidden rounded-xl border border-[#D6E4F0] bg-white shadow-[0_20px_50px_rgba(11,31,58,0.12)] md:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden bg-[#0B1F3A] p-10 text-white md:flex md:flex-col md:justify-between">
          <div><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14B8A6] text-lg font-bold text-[#0B1F3A]">M</span><span className="text-xl font-medium">MarkMyDay</span></div><p className="mt-16 text-3xl font-medium leading-tight">A clearer day for every classroom.</p><p className="mt-4 max-w-xs text-sm leading-6 text-[#9FB6D0]">Attendance, leave, and school operations in one calm workspace.</p></div>
          <p className="text-xs text-[#7FA0C2]">School operations platform</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 sm:p-10">
          <div className="mb-8 md:hidden"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14B8A6] text-lg font-bold text-[#0B1F3A]">M</span><p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#2563EB]">MarkMyDay</p></div>
          <p className="text-sm font-semibold text-[#2563EB]">Welcome back</p>
          <h1 className="mt-2 text-3xl font-medium text-[#0B1F3A]">Sign in to your workspace</h1>
          <p className="mt-2 text-sm text-[#5B7590]">Use your school account to continue.</p>
          <label className="mt-7 block text-sm font-semibold text-[#0B1F3A]">
          Email
          <input className="field mt-2" type="email" autoComplete="email" placeholder="you@school.edu" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label className="mt-5 block text-sm font-semibold text-[#0B1F3A]">
          Password
          <input className="field mt-2" type="password" autoComplete="current-password" placeholder="Enter your password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </label>
        {error && <p className="error-message">{error}</p>}
        <button className="button-primary mt-7 w-full" disabled={submitting} type="submit">
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="mt-7 text-center text-sm text-[#5B7590]">
          Don&apos;t have an account? <Link className="font-semibold text-[#2563EB] hover:underline" to="/register">Create one</Link>
        </p>
        </form>
      </section>
    </main>
  );
}
