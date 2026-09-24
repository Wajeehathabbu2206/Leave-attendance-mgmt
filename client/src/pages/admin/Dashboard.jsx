import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardCard from '../../components/DashboardCard';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageLayout from '../../components/PageLayout';
import StatCard from '../../components/StatCard';
import api from '../../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api.get('/admin/dashboard').then(({ data: response }) => setData(response.data)).catch((err) => setError(err.response?.data?.message || 'Unable to load dashboard')); }, []);
  return <PageLayout><div className="mb-8"><p className="text-sm font-semibold text-blue-600">Admin overview</p><h1 className="page-title mt-1">School operations at a glance</h1></div>{error && <p className="error-message">{error}</p>}{!data && !error ? <LoadingSpinner /> : data ? <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total students" tone="blue" value={data.totalStudents} /><StatCard label="Total teachers" tone="purple" value={data.totalTeachers} /><StatCard detail="Today" label="Attendance" tone="green" value={`${data.overallAttendancePercentage}%`} /><StatCard label="Pending leaves" tone="yellow" value={data.pendingLeaveRequests} /></div><DashboardCard title="Quick links"><div className="flex flex-wrap gap-3"><Link className="button-primary" to="/admin/classes">Manage classes</Link><Link className="button-secondary" to="/admin/students">Manage students</Link><Link className="button-secondary" to="/admin/parents">Manage parents</Link></div></DashboardCard></> : <EmptyState />}</PageLayout>;
}