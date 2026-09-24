import HealthStatus from '../components/HealthStatus';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <section className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-xl shadow-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">MarkMyDay</p>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">{user.role} dashboard</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">Welcome, {user.name}</h1>
        <p className="mt-4 text-slate-600">Your Leave & Attendance Management home page.</p>
        <HealthStatus />
        <div className="mt-6 flex justify-center gap-4">
          {user.role === 'admin' && <Link className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white" to="/admin">Admin area</Link>}
          {user.role === 'teacher' && <><Link className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white" to="/teacher/attendance">Mark attendance</Link><Link className="rounded-lg border border-indigo-600 px-4 py-2 font-semibold text-indigo-700" to="/teacher/leave">Leave requests</Link></>}
          {user.role === 'student' && <><Link className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white" to="/student/attendance">My attendance</Link><Link className="rounded-lg border border-indigo-600 px-4 py-2 font-semibold text-indigo-700" to="/student/leave">Request leave</Link></>}
          {user.role === 'parent' && <><Link className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white" to="/parent/attendance">Child attendance</Link><Link className="rounded-lg border border-indigo-600 px-4 py-2 font-semibold text-indigo-700" to="/parent/leave">Leave records</Link></>}
          <button className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700" onClick={logout} type="button">Sign out</button>
        </div>
      </section>
    </main>
  );
}
