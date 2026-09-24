import { useState } from 'react';
import api from '../../services/api';
import ParentForm from '../../components/ParentForm';

export default function Parents() {
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function createParent(form) { setBusy(true); setMessage(''); setError(''); try { const { data } = await api.post('/admin/parents', form); setMessage(data.message); } catch (err) { setError(err.response?.data?.message || 'Unable to create parent'); } finally { setBusy(false); } }
  return <section><div className="mb-6"><h2 className="page-title">Parents</h2><p className="page-subtitle">Create a parent account and link existing students.</p></div><div className="panel"><ParentForm busy={busy} onSubmit={createParent} /></div>{message && <p className="success-message">{message}</p>}{error && <p className="error-message">{error}</p>}</section>;
}