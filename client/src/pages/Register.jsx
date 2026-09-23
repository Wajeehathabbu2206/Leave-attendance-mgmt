import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const initialForm = { name: '', email: '', password: '', role: 'teacher' };

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setForm((currentForm) => ({ ...currentForm, [event.target.name]: event.target.value }));
    setError('');
    setSuccess('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.post('/auth/register', form);
      setForm(initialForm);
      setSuccess('Account created successfully. Redirecting to sign in...');
      setTimeout(() => navigate('/login'), 900);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create account');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <section className="mx-auto w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl shadow-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">MarkMyDay</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Create an account</h1>
            <p className="mt-2 text-slate-600">Add a teacher, student, or parent account.</p>
          </div>
          <Link className="text-sm text-indigo-600 underline" to="/login">Sign in</Link>
        </div>

        <form className="mt-8" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Full name
            <input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" name="name" required value={form.name} onChange={updateField} />
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Email
            <input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" name="email" type="email" required value={form.email} onChange={updateField} />
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Temporary password
            <input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" name="password" type="password" minLength="6" required value={form.password} onChange={updateField} />
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Role
            <select className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2" name="role" value={form.role} onChange={updateField}>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
            </select>
          </label>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-4 text-sm text-emerald-600">{success}</p>}

          <button className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={submitting} type="submit">
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link className="font-semibold text-indigo-600 underline" to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
