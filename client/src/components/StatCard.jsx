const tones = { blue: 'border-[#C9D9FA] bg-[#F0F5FF] text-[#2563EB]', green: 'border-[#BCEBE3] bg-[#E6F8F5] text-[#0F766E]', yellow: 'border-[#F4DCA7] bg-[#FDF0D5] text-[#8A5300]', purple: 'border-[#D8D1F4] bg-[#ECE8FB] text-[#4C3BA8]', red: 'border-[#F5C4CC] bg-[#FDE4E8] text-[#9F1F35]' };

export default function StatCard({ label, value, tone = 'blue', detail }) {
  return <article className={`rounded-xl border p-5 shadow-sm ${tones[tone] || tones.blue}`}><p className="text-sm font-semibold">{label}</p><p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>{detail && <p className="mt-1 text-xs text-slate-600">{detail}</p>}</article>;
}