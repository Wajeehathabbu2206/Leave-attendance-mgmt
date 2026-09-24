import StatusBadge from './StatusBadge';

export default function LeaveTable({ leaves, actions }) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table min-w-[760px]">
        <thead><tr><th>Student</th><th>Dates</th><th>Type</th><th>Reason</th><th>Status</th>{actions && <th>Actions</th>}</tr></thead>
        <tbody>{leaves.map((leave) => <tr key={leave._id}>
          <td>{leave.studentId?.userId?.name || '-'}</td>
          <td>{leave.fromDate} to {leave.toDate}</td>
          <td className="capitalize">{leave.type}</td>
          <td className="max-w-xs whitespace-normal">{leave.reason}</td>
          <td><StatusBadge status={leave.status} /></td>
          {actions && <td>{actions(leave)}</td>}
        </tr>)}</tbody>
      </table>
      {!leaves.length && <p className="py-8 text-center text-sm text-slate-500">No leave requests found.</p>}
    </div>
  );
}