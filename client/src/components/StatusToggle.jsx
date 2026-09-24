const statuses = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
];

export default function StatusToggle({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Attendance status">
      {statuses.map((status) => (
        <button
          className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${value === status.value ? `status-${status.value}` : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          key={status.value}
          onClick={() => onChange(status.value)}
          type="button"
        >
          {status.label}
        </button>
      ))}
    </div>
  );
}