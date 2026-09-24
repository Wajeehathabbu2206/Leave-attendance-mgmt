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
    <main className="min-h-screen bg-[#F2F7FB] px-6 py-10">
      <section className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-xl border border-[#D6E4F0] bg-white shadow-[0_20px_50px_rgba(11,31,58,0.12)] md:grid-cols-[0.72fr_1.28fr]">
        <div className="hidden bg-[#0B1F3A] p-10 text-white md:block"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14B8A6] text-lg font-bold text-[#0B1F3A]">M</span><span className="text-xl font-medium">MarkMyDay</span></div><p className="mt-16 text-3xl font-medium leading-tight">Set up the people who make school happen.</p><p className="mt-4 text-sm leading-6 text-[#9FB6D0]">Create a role-based account and bring your school workspace together.</p></div>
        <div className="p-8 sm:p-10">
          <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#2563EB]">New account</p>
            <h1 className="mt-2 text-3xl font-medium text-[#0B1F3A]">Create an account</h1>
            <p className="mt-2 text-sm text-[#5B7590]">Add a teacher, student, or parent account.</p>
          </div>
          <Link className="text-sm font-semibold text-[#2563EB] hover:underline" to="/login">Sign in</Link>
        </div>

        <form className="mt-8 grid gap-x-4 gap-y-5 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-[#0B1F3A] sm:col-span-2">
            Full name
            <input className="field mt-2" autoComplete="name" name="name" placeholder="Full name" required value={form.name} onChange={updateField} />
          </label>

          <label className="block text-sm font-semibold text-[#0B1F3A]">
            Email
            <input className="field mt-2" autoComplete="email" name="email" placeholder="you@school.edu" type="email" required value={form.email} onChange={updateField} />
          </label>

          <label className="block text-sm font-semibold text-[#0B1F3A]">
            Temporary password
            <input className="field mt-2" autoComplete="new-password" name="password" placeholder="At least 6 characters" type="password" minLength="6" required value={form.password} onChange={updateField} />
          </label>

          <label className="block text-sm font-semibold text-[#0B1F3A] sm:col-span-2">
            Role
            <select className="field mt-2" name="role" value={form.role} onChange={updateField}>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
            </select>
          </label>

          {error && <p className="error-message sm:col-span-2">{error}</p>}
          {success && <p className="success-message sm:col-span-2">{success}</p>}

          <button className="button-primary w-full sm:col-span-2" disabled={submitting} type="submit">
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-[#5B7590]">
          Already have an account? <Link className="font-semibold text-[#2563EB] hover:underline" to="/login">Sign in</Link>
        </p>
        </div>
      </section>
    </main>
  );
}
