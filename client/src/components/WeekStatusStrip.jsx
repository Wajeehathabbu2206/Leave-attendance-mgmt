const statusStyles = {
  present: ['bg-[#DDF5F1]', 'text-[#0F766E]', '✓'],
  absent: ['bg-[#FDE4E8]', 'text-[#9F1F35]', '×'],
  late: ['bg-[#FDF0D5]', 'text-[#8A5300]', '~'],
  leave: ['bg-[#ECE8FB]', 'text-[#4C3BA8]', 'L'],
  upcoming: ['bg-[#EEF3F8]', 'text-[#7A93AD]', ''],
};

export default function WeekStatusStrip({ records = [] }) {
  const today = new Date();
  const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const days = Array.from({ length: 5 }, (_, index) => { const date = new Date(monday); date.setDate(monday.getDate() + index); const key = date.toISOString().slice(0, 10); const record = records.find((item) => item.date === key); return { key, label: date.toLocaleDateString('en-US', { weekday: 'short' }), day: date.getDate(), status: record?.status || (date > today ? 'upcoming' : 'unmarked') }; });
  return <section className="panel p-4 sm:px-5"><div className="flex items-center justify-between"><h2 className="text-sm font-medium text-[#0B1F3A]">This week</h2><div className="hidden gap-4 text-xs text-[#5B7590] sm:flex"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#14B8A6]" />Marked</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#C5D8E9]" />Upcoming</span></div></div><div className="mt-3 flex gap-2">{days.map((item) => { const style = statusStyles[item.status] || statusStyles.upcoming; const isToday = item.key === today.toISOString().slice(0, 10); return <div className="flex-1 text-center" key={item.key}><div className={`text-xs ${isToday ? 'font-semibold text-[#2563EB]' : 'text-[#5B7590]'}`}>{item.label}</div><div className={`mx-auto mt-1 flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${style[0]} ${style[1]} ${isToday && item.status === 'upcoming' ? 'border-2 border-[#2563EB]' : ''}`}>{style[2] || item.day}</div></div>; })}</div></section>;
}