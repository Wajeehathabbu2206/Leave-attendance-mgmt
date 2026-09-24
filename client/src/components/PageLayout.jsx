import Navbar from './Navbar';

export default function PageLayout({ children }) {
  return <main className="min-h-screen bg-slate-50 text-slate-900"><Navbar /><div className="mx-auto max-w-7xl px-6 py-8">{children}</div></main>;
}