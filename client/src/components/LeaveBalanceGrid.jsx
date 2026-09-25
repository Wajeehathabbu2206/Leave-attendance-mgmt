import LeaveBalanceCard from "./LeaveBalanceCard";

export default function LeaveBalanceGrid({ balances, loading }) {
  if (loading)
    return (
      <div className="panel mb-6">
        <p className="text-sm text-slate-500">Loading leave balances...</p>
      </div>
    );
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      {balances.map((balance) => (
        <LeaveBalanceCard balance={balance} key={balance.leaveType} />
      ))}
    </div>
  );
}
