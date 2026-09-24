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
  const date = new Date(); const [children, setChildren] = useState([]); const [studentId, setStudentId] = useState(''); const [attendance, setAttendance] = useState(null); const [balances, setBalances] = useState([]); const [leaves, setLeaves] = useState([]); const [error, setError] = useState('');
  useEffect(() => { api.get('/parent/children').then(({ data }) => { setChildren(data.data); setStudentId(data.data[0]?._id || ''); }).catch((err) => setError(err.response?.data?.message || 'Unable to load children')); }, []);
  useEffect(() => { if (!studentId) return; Promise.all([api.get('/parent/attendance', { params: { studentId, month: date.getMonth() + 1, year: date.getFullYear() } }), api.get('/parent/leave-balance', { params: { studentId } }), api.get('/parent/leave', { params: { studentId } })]).then(([attendanceResponse, balanceResponse, leaveResponse]) => { setAttendance(attendanceResponse.data.data); setBalances(balanceResponse.data.data); setLeaves(leaveResponse.data.data); }).catch((err) => setError(err.response?.data?.message || 'Unable to load dashboard')); }, [studentId]);
  const child = children.find((item) => item._id === studentId);
  return <PageLayout><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-blue-600">Parent overview</p><h1 className="page-title mt-1">Stay close to your child’s progress</h1></div><select className="field max-w-xs" onChange={(event) => setStudentId(event.target.value)} value={studentId}><option value="">Select child</option>{children.map((item) => <option key={item._id} value={item._id}>{item.userId?.name}</option>)}</select></div>{error && <p className="error-message">{error}</p>}{!attendance && !error ? <LoadingSpinner /> : attendance ? <><DashboardCard title={child ? `${child.userId?.name}'s monthly attendance` : 'Monthly attendance'}><div className="flex items-end justify-between"><p className="text-5xl font-bold text-blue-700">{attendance.percentage}%</p><Link className="button-secondary" to="/parent/attendance">View details</Link></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(attendance.percentage, 100)}%` }} /></div></DashboardCard><LeaveBalanceGrid balances={balances} loading={false} /><DashboardCard title="Recent leave request">{leaves.length ? <LeaveTable leaves={[leaves[0]]} /> : <EmptyState title="No leave requests" />}<Link className="mt-4 inline-block text-sm font-semibold text-blue-600" to="/parent/leave">Open leave records</Link></DashboardCard></> : <EmptyState />}</PageLayout>;
}