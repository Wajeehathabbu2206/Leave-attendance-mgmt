import StatusToggle from './StatusToggle';

export default function AttendanceTable({ records, editable = false, onStatusChange, onRemarksChange }) {
  if (!editable) {
    return (
      <div className="overflow-x-auto">
        <table className="data-table min-w-[420px]">
          <thead><tr><th>Date</th><th>Status</th></tr></thead>
          <tbody>{records.map((record) => <tr key={record.studentId}><td>{record.date}</td><td><span className={`status-pill status-${record.status}`}>{record.status}</span></td></tr>)}</tbody>
        </table>
        {!records.length && <p className="py-8 text-center text-sm text-slate-500">No attendance records found.</p>}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table min-w-[700px]">
        <thead><tr><th>Roll no</th><th>Name</th><th>Status</th><th>Remarks</th></tr></thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.studentId}>
              <td>{record.rollNo}</td>
              <td>{record.name}</td>
              <td>{editable ? <StatusToggle onChange={(status) => onStatusChange(record.studentId, status)} value={record.status} /> : <span className={`status-pill status-${record.status}`}>{record.status}</span>}</td>
              <td>{editable ? <input className="field max-w-xs" onChange={(event) => onRemarksChange(record.studentId, event.target.value)} placeholder="Optional" value={record.remarks || ''} /> : (record.remarks || '-')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!records.length && <p className="py-8 text-center text-sm text-slate-500">No attendance records found.</p>}
    </div>
  );
}