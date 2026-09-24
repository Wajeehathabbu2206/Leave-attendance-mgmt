import { useEffect, useState } from 'react';
import LeaveForm from '../../components/LeaveForm';
import LeaveTable from '../../components/LeaveTable';
import api from '../../services/api';

export default function LeaveRequest() {
  const [leaves, setLeaves] = useState([]); const [busy, setBusy] = useState(false); const [loading, setLoading] = useState(true); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  async function load() { const { data } = await api.get('/student/leave'); setLeaves(data.data); }
  useEffect(() => { load().catch((err) => setError(err.response?.data?.message || 'Unable to load leave history')).finally(() => setLoading(false)); }, []);
  async function submit(form) { setBusy(true); setMessage(''); setError(''); try { const { data } = await api.post('/student/leave', form); setLeaves([data.data, ...leaves]); setMessage(data.message); } catch (err) { setError(err.response?.data?.message || 'Unable to submit leave request'); } finally { setBusy(false); } }
  return <section><div className="mb-6"><h2 className="page-title">Request leave</h2><p className="page-subtitle">Submit a leave request and track its review status.</p></div><div className="panel"><LeaveForm busy={busy} onSubmit={submit} /></div>{message && <p className="success-message">{message}</p>}{error && <p className="error-message">{error}</p>}<div className="panel mt-6"><h3 className="mb-4 text-lg font-bold">Leave history</h3>{loading ? <p className="py-8 text-center text-slate-500">Loading leave history...</p> : <LeaveTable leaves={leaves} />}</div></section>;
}