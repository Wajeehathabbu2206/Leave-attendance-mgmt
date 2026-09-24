export default function EmptyState({ title = 'Nothing here yet', message = 'There is no data to display.' }) {
  return <div className="py-10 text-center"><p className="font-semibold text-slate-700">{title}</p><p className="mt-1 text-sm text-slate-500">{message}</p></div>;
}