import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = {
  admin: [['/admin', 'Admin'], ['/admin/classes', 'Classes'], ['/admin/students', 'Students'], ['/admin/parents', 'Parents']],
  teacher: [['/dashboard', 'Overview'], ['/teacher/attendance', 'Attendance'], ['/teacher/leave', 'Leave'], ['/teacher/reports/attendance', 'Reports']],
  student: [['/dashboard', 'Overview'], ['/student/attendance', 'Attendance'], ['/student/leave', 'Leave']],
  parent: [['/dashboard', 'Overview'], ['/parent/attendance', 'Attendance'], ['/parent/leave', 'Leave']],
};

export default function Navbar() {
  const { user, logout } = useAuth(); const location = useLocation();
  return <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4"><Link className="shrink-0" to="/dashboard"><p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">MarkMyDay</p><p className="text-lg font-bold text-slate-900">{user.role} workspace</p></Link><nav className="hidden items-center gap-1 md:flex">{(links[user.role] || []).map(([to, label]) => <Link className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${location.pathname === to ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`} key={to} to={to}>{label}</Link>)}</nav><button className="button-secondary" onClick={logout} type="button">Sign out</button></div><nav className="flex gap-1 overflow-x-auto px-6 pb-3 md:hidden">{(links[user.role] || []).map(([to, label]) => <Link className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${location.pathname === to ? 'bg-blue-50 text-blue-700' : 'text-slate-500'}`} key={to} to={to}>{label}</Link>)}</nav></header>;
}