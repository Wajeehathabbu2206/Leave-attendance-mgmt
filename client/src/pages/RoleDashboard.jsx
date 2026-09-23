import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function RoleDashboard({ role }) {
  const { user, logout } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <section className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-xl shadow-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">MarkMyDay</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">{role} dashboard</h1>
        <p className="mt-4 text-slate-600">Signed in as {user.name}.</p>
        {role === 'admin' && (
          <Link className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white" to="/register">
            Create user account
          </Link>
        )}
        <button className="mt-6 rounded-lg border border-slate-300 px-4 py-2 text-slate-700" onClick={logout} type="button">Sign out</button>
      </section>
    </main>
  );
}
