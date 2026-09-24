export default function ProgressBar({ value, tone = 'teal' }) {
  const colors = { teal: 'bg-[#14B8A6]', blue: 'bg-[#2563EB]', orange: 'bg-[#F2A93B]' };
  return <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E6EFF7]"><div className={`h-full rounded-full transition-all ${colors[tone] || colors.teal}`} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} /></div>;
}