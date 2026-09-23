import { Link } from 'react-router-dom';

export default function NotAuthorized() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 text-center">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Not authorized</h1>
        <p className="mt-3 text-slate-600">Your account does not have access to this area.</p>
        <Link className="mt-6 inline-block text-indigo-600 underline" to="/">Return home</Link>
      </section>
    </main>
  );
}
