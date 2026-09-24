export default function DashboardCard({ title, children, action }) {
  return <section className="panel"> <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>{action}</div>{children}</section>;
}