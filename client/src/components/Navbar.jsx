import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = {
  admin: [['/admin/dashboard', 'Overview'], ['/admin/classes', 'Classes'], ['/admin/students', 'Students'], ['/admin/parents', 'Parents']],
  teacher: [['/dashboard', 'Overview'], ['/teacher/attendance', 'Attendance'], ['/teacher/leave', 'Leave'], ['/teacher/reports/attendance', 'Reports']],
  student: [['/dashboard', 'Overview'], ['/student/attendance', 'Attendance'], ['/student/leave', 'Leave']],
  parent: [['/dashboard', 'Overview'], ['/parent/attendance', 'Attendance'], ['/parent/leave', 'Leave']],
};

export default function Navbar() {
  const { user, logout } = useAuth(); const location = useLocation();
  return <header className="bg-[#0B1F3A] text-white shadow-lg"><div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3"><Link className="flex shrink-0 items-center gap-2" to="/dashboard"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#14B8A6] text-sm font-bold text-[#0B1F3A]">M</span><span><span className="block text-sm font-medium text-white">MarkMyDay</span><span className="block text-[11px] capitalize text-[#7FA0C2]">{user.role} workspace</span></span></Link><nav className="hidden items-center gap-1 md:flex">{(links[user.role] || []).map(([to, label]) => <Link className={`rounded-lg px-3 py-2 text-sm transition ${location.pathname === to ? 'bg-[#1B3A63] text-[#E6F1FB]' : 'text-[#9FB6D0] hover:bg-[#142E50] hover:text-white'}`} key={to} to={to}>{label}</Link>)}</nav><button className="rounded-lg border border-[#2C4C78] px-3 py-2 text-sm text-[#CFE0F1] transition hover:bg-[#142E50]" onClick={logout} type="button">Sign out</button></div><nav className="flex gap-1 overflow-x-auto px-6 pb-3 md:hidden">{(links[user.role] || []).map(([to, label]) => <Link className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${location.pathname === to ? 'bg-[#1B3A63] text-[#E6F1FB]' : 'text-[#9FB6D0]'}`} key={to} to={to}>{label}</Link>)}</nav></header>;
}