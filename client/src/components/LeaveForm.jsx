import { useState } from 'react';

const initialState = { fromDate: '', toDate: '', type: 'sick', reason: '' };

export default function LeaveForm({ busy, onSubmit }) {
  const [form, setForm] = useState(initialState);
  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) { event.preventDefault(); await onSubmit(form); setForm(initialState); }
  return <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
    <label className="text-sm font-semibold text-slate-700">From date<input className="field mt-2" name="fromDate" onChange={update} required type="date" value={form.fromDate} /></label>
    <label className="text-sm font-semibold text-slate-700">To date<input className="field mt-2" name="toDate" onChange={update} required type="date" value={form.toDate} /></label>
    <label className="text-sm font-semibold text-slate-700">Type<select className="field mt-2" name="type" onChange={update} value={form.type}><option value="sick">Sick</option><option value="casual">Casual</option><option value="other">Other</option></select></label>
    <label className="text-sm font-semibold text-slate-700 md:col-span-2">Reason<textarea className="field mt-2 min-h-24" name="reason" onChange={update} required value={form.reason} /></label>
    <button className="button-primary md:col-span-2" disabled={busy} type="submit">{busy ? 'Submitting...' : 'Submit leave request'}</button>
  </form>;
}