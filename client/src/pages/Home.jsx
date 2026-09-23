import HealthStatus from '../components/HealthStatus';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <section className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-xl shadow-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">MarkMyDay</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">Leave & Attendance Management</h1>
        <p className="mt-4 text-slate-600">Your school portal foundation is ready.</p>
        <HealthStatus />
      </section>
    </main>
  );
}
