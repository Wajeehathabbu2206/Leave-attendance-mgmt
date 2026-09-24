import { useEffect, useState } from 'react';
import AttendanceTable from '../../components/AttendanceTable';
import api from '../../services/api';

function currentPeriod() { const date = new Date(); return { month: date.getMonth() + 1, year: date.getFullYear() }; }

export default function MyAttendance() {
  const period = currentPeriod(); const [month, setMonth] = useState(period.month); const [year, setYear] = useState(period.year); const [data, setData] = useState({ records: [], percentage: 0 }); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { setLoading(true); api.get('/student/attendance', { params: { month, year } }).then(({ data: response }) => setData(response.data)).catch((err) => setError(err.response?.data?.message || 'Unable to load attendance')).finally(() => setLoading(false)); }, [month, year]);
  const rows = data.records.map((record) => ({ ...record, studentId: record.date, rollNo: record.date, name: record.date }));
  return <AttendanceView data={data} error={error} loading={loading} month={month} onMonthChange={setMonth} onYearChange={setYear} rows={rows} title="My attendance" year={year} />;
}

export function AttendanceView({ data, error, loading, month, onMonthChange, onYearChange, rows, title, year }) {
  return <section><div className="mb-6"><h2 className="page-title">{title}</h2><p className="page-subtitle">Review attendance for the selected month.</p></div><div className="mb-6 grid gap-4 md:grid-cols-[1fr_1fr_2fr]"><div className="panel"><p className="text-sm text-slate-500">Attendance percentage</p><p className="mt-2 text-4xl font-bold text-indigo-700">{data.percentage}%</p></div><div className="panel md:col-span-2"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Month<select className="field mt-2" onChange={(event) => onMonthChange(Number(event.target.value))} value={month}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{new Date(2000, index).toLocaleString('default', { month: 'long' })}</option>)}</select></label><label className="text-sm font-semibold text-slate-700">Year<input className="field mt-2" max="2100" min="2000" onChange={(event) => onYearChange(Number(event.target.value))} type="number" value={year} /></label></div></div></div>{error && <p className="error-message">{error}</p>}<div className="panel">{loading ? <p className="py-8 text-center text-slate-500">Loading attendance...</p> : <AttendanceTable records={rows} />}</div></section>;
}