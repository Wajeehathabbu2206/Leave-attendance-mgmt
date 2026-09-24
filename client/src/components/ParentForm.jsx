import { useState } from 'react';

export default function ParentForm({ onSubmit, busy }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', students: '' });

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    await onSubmit({ ...form, students: form.students.split(',').map((item) => item.trim()).filter(Boolean) });
    setForm({ name: '', email: '', password: '', students: '' });
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
      <input className="field" name="name" onChange={update} placeholder="Parent name" required value={form.name} />
      <input className="field" name="email" onChange={update} placeholder="Email" required type="email" value={form.email} />
      <input className="field" minLength="8" name="password" onChange={update} placeholder="Temporary password" required type="password" value={form.password} />
      <input className="field" name="students" onChange={update} placeholder="Student roll numbers or emails, comma separated" required value={form.students} />
      <button className="button-primary md:col-span-2" disabled={busy} type="submit">{busy ? 'Creating...' : 'Create parent'}</button>
    </form>
  );
}