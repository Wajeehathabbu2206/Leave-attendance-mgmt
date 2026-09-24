import { useEffect, useState } from 'react';
import AttendanceCalendar from '../../components/AttendanceCalendar';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageLayout from '../../components/PageLayout';
import api from '../../services/api';

export default function AttendanceCalendarPage() {
  const now = new Date(); const [month, setMonth] = useState(now.getMonth() + 1); const [year, setYear] = useState(now.getFullYear()); const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { setLoading(true); api.get('/student/attendance/calendar', { params: { month, year } }).then(({ data: response }) => setData(response.data)).catch((err) => setError(err.response?.data?.message || 'Unable to load calendar')).finally(() => setLoading(false)); }, [month, year]);
  return <PageLayout><div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="overview-kicker">Attendance calendar</p><h1 className="overview-title">Your attendance, day by day</h1></div><div className="flex gap-2"><select className="field" onChange={(event) => setMonth(Number(event.target.value))} value={month}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{new Date(2000, index).toLocaleString('default', { month: 'long' })}</option>)}</select><input className="field w-28" onChange={(event) => setYear(Number(event.target.value))} type="number" value={year} /></div></div>{error && <p className="error-message">{error}</p>}{loading ? <LoadingSpinner /> : data ? <AttendanceCalendar days={data.days} month={data.month} year={data.year} /> : <EmptyState />}</PageLayout>;
}