import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardCard from '../../components/DashboardCard';
import EmptyState from '../../components/EmptyState';
import LeaveBalanceGrid from '../../components/LeaveBalanceGrid';
import LeaveTable from '../../components/LeaveTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageLayout from '../../components/PageLayout';
import api from '../../services/api';

export default function Dashboard() {
  const date = new Date(); const [attendance, setAttendance] = useState(null); const [balances, setBalances] = useState([]); const [leaves, setLeaves] = useState([]); const [error, setError] = useState('');
  useEffect(() => { Promise.all([api.get('/student/attendance', { params: { month: date.getMonth() + 1, year: date.getFullYear() } }), api.get('/student/leave-balance'), api.get('/student/leave')]).then(([attendanceResponse, balanceResponse, leaveResponse]) => { setAttendance(attendanceResponse.data.data); setBalances(balanceResponse.data.data); setLeaves(leaveResponse.data.data); }).catch((err) => setError(err.response?.data?.message || 'Unable to load dashboard')); }, []);
  return <PageLayout><div className="mb-8"><p className="text-sm font-semibold text-blue-600">Student overview</p><h1 className="page-title mt-1">Your school day, clearly organized</h1></div>{error && <p className="error-message">{error}</p>}{!attendance && !error ? <LoadingSpinner /> : attendance ? <><DashboardCard title="Monthly attendance"><div className="flex items-end justify-between"><p className="text-5xl font-bold text-blue-700">{attendance.percentage}%</p><Link className="button-secondary" to="/student/attendance">View details</Link></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(attendance.percentage, 100)}%` }} /></div></DashboardCard><LeaveBalanceGrid balances={balances} loading={false} /><DashboardCard title="Recent leave request">{leaves.length ? <LeaveTable leaves={[leaves[0]]} /> : <EmptyState title="No leave requests" message="Your submitted requests will appear here." />}<Link className="mt-4 inline-block text-sm font-semibold text-blue-600" to="/student/leave">Open leave dashboard</Link></DashboardCard></> : <EmptyState />}</PageLayout>;
}