const tones = { blue: 'border-blue-200 bg-blue-50 text-blue-700', green: 'border-green-200 bg-green-50 text-green-700', yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700', purple: 'border-purple-200 bg-purple-50 text-purple-700', red: 'border-red-200 bg-red-50 text-red-700' };

export default function StatCard({ label, value, tone = 'blue', detail }) {
  return <article className={`rounded-xl border p-5 shadow-sm ${tones[tone] || tones.blue}`}><p className="text-sm font-semibold">{label}</p><p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>{detail && <p className="mt-1 text-xs text-slate-600">{detail}</p>}</article>;
}