import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin/classes', label: 'Classes' },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/parents', label: 'Parents' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600">MarkMyDay</p><h1 className="text-2xl font-bold">Admin workspace</h1></div>
          <button className="button-secondary" onClick={logout} type="button">Sign out</button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-6" aria-label="Admin navigation">
          {links.map((link) => <Link className={`border-b-2 pb-3 text-sm font-semibold ${location.pathname === link.to ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500'}`} key={link.to} to={link.to}>{link.label}</Link>)}
        </nav>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-8"><p className="mb-6 text-sm text-slate-500">Signed in as {user.name}</p><Outlet /></div>
    </main>
  );
}