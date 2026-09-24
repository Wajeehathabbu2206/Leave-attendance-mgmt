import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardCard from '../../components/DashboardCard';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageLayout from '../../components/PageLayout';
import StatCard from '../../components/StatCard';
import api from '../../services/api';

export default function Dashboard() {
  const [classes, setClasses] = useState([]); const [classSectionId, setClassSectionId] = useState(''); const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api.get('/teacher/classes').then(({ data: response }) => { setClasses(response.data); setClassSectionId(response.data[0]?._id || ''); }).catch((err) => setError(err.response?.data?.message || 'Unable to load classes')); }, []);
  useEffect(() => { if (classSectionId) api.get('/teacher/dashboard', { params: { classSectionId } }).then(({ data: response }) => setData(response.data)).catch((err) => setError(err.response?.data?.message || 'Unable to load dashboard')); }, [classSectionId]);
  return <PageLayout><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-blue-600">Teacher overview</p><h1 className="page-title mt-1">Today in your classroom</h1></div><select className="field max-w-xs" onChange={(event) => setClassSectionId(event.target.value)} value={classSectionId}><option value="">Select class</option>{classes.map((item) => <option key={item._id} value={item._id}>{item.grade} - {item.section}</option>)}</select></div>{error && <p className="error-message">{error}</p>}{!data && !error ? <LoadingSpinner /> : data ? <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Present" tone="green" value={data.attendanceSummary.present} /><StatCard label="Absent" tone="red" value={data.attendanceSummary.absent} /><StatCard label="Late" tone="yellow" value={data.attendanceSummary.late} /><StatCard label="Leave" tone="purple" value={data.attendanceSummary.leave} /></div><DashboardCard title="Pending leave requests"><div className="flex items-center justify-between gap-4"><div><p className="text-3xl font-bold">{data.pendingLeaveRequests}</p><p className="mt-1 text-sm text-slate-500">Requests waiting for your review</p></div><div className="flex gap-3"><Link className="button-primary" to="/teacher/attendance">Mark attendance</Link><Link className="button-secondary" to="/teacher/leave">Review leave</Link></div></div></DashboardCard></> : <EmptyState />}</PageLayout>;
}