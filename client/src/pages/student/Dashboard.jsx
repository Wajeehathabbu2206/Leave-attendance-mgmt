import { useEffect, useState } from 'react';
import DashboardCard from '../../components/DashboardCard';
import AttendanceOverviewCard from '../../components/AttendanceOverviewCard';
import EmptyState from '../../components/EmptyState';
import LeaveBalanceGrid from '../../components/LeaveBalanceGrid';
import LeaveTable from '../../components/LeaveTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageLayout from '../../components/PageLayout';
import WeekStatusStrip from '../../components/WeekStatusStrip';
import api from '../../services/api';

export default function Dashboard() {
  const date = new Date(); const [attendance, setAttendance] = useState(null); const [balances, setBalances] = useState([]); const [leaves, setLeaves] = useState([]); const [error, setError] = useState('');
  useEffect(() => { Promise.all([api.get('/student/attendance', { params: { month: date.getMonth() + 1, year: date.getFullYear() } }), api.get('/student/leave-balance'), api.get('/student/leave')]).then(([attendanceResponse, balanceResponse, leaveResponse]) => { setAttendance(attendanceResponse.data.data); setBalances(balanceResponse.data.data); setLeaves(leaveResponse.data.data); }).catch((err) => setError(err.response?.data?.message || 'Unable to load dashboard')); }, []);
  const counts = ['present', 'absent', 'late', 'leave'].map((status) => ({ label: status[0].toUpperCase() + status.slice(1), value: attendance?.records?.filter((record) => record.status === status).length || 0, color: { present: 'text-[#0F766E]', absent: 'text-[#D9485F]', late: 'text-[#C77D0A]', leave: 'text-[#6D5BD0]' }[status] }));
  return <PageLayout><div className="mb-6 flex items-end justify-between gap-4"><div><p className="overview-kicker">Student overview</p><h1 className="overview-title">Your school day, clearly organized</h1></div><p className="hidden text-xs text-[#5B7590] sm:block">{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</p></div>{error && <p className="error-message">{error}</p>}{!attendance && !error ? <LoadingSpinner /> : attendance ? <><AttendanceOverviewCard attendance={attendance} detailsPath="/student/attendance" summary={counts} title="Monthly attendance" /><WeekStatusStrip records={attendance.records} /><LeaveBalanceGrid balances={balances} loading={false} /><DashboardCard title="Recent leave requests"><div className="flex items-center justify-between"><span className="text-xs text-[#5B7590]">Your latest submission</span><a className="text-sm font-medium text-[#2563EB]" href="/student/leave">Open leave dashboard →</a></div>{leaves.length ? <LeaveTable leaves={[leaves[0]]} /> : <EmptyState title="No leave requests" message="Your submitted requests will appear here." />}</DashboardCard></> : <EmptyState />}</PageLayout>;
}