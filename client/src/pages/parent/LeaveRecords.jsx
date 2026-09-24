import { useEffect, useState } from 'react';
import LeaveTable from '../../components/LeaveTable';
import api from '../../services/api';

export default function LeaveRecords() {
  const [children, setChildren] = useState([]); const [studentId, setStudentId] = useState(''); const [leaves, setLeaves] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { api.get('/parent/children').then(({ data }) => { setChildren(data.data); setStudentId(data.data[0]?._id || ''); }).catch((err) => setError(err.response?.data?.message || 'Unable to load children')).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (!studentId) return; setLoading(true); api.get('/parent/leave', { params: { studentId } }).then(({ data }) => setLeaves(data.data)).catch((err) => setError(err.response?.data?.message || 'Unable to load leave records')).finally(() => setLoading(false)); }, [studentId]);
  return <section><div className="mb-6"><h2 className="page-title">Leave records</h2><p className="page-subtitle">View leave history for a linked child.</p></div><div className="panel mb-6"><label className="text-sm font-semibold text-slate-700">Child<select className="field mt-2 max-w-md" onChange={(event) => setStudentId(event.target.value)} value={studentId}><option value="">Select child</option>{children.map((item) => <option key={item._id} value={item._id}>{item.userId?.name} ({item.classSectionId?.grade}-{item.classSectionId?.section})</option>)}</select></label></div>{error && <p className="error-message">{error}</p>}<div className="panel">{loading ? <p className="py-8 text-center text-slate-500">Loading leave records...</p> : <LeaveTable leaves={leaves} />}</div></section>;
}