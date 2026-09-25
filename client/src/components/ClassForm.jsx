import { useState } from "react";

const initialState = { grade: "", section: "", classTeacherId: "" };

export default function ClassForm({ teachers, onSubmit, busy }) {
  const [form, setForm] = useState(initialState);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    await onSubmit(form);
    setForm(initialState);
  }

  return (
    <form className="grid gap-4 md:grid-cols-4" onSubmit={submit}>
      <input
        className="field"
        name="grade"
        onChange={update}
        placeholder="Grade (e.g. 10)"
        required
        value={form.grade}
      />
      <input
        className="field"
        name="section"
        onChange={update}
        placeholder="Section (e.g. A)"
        required
        value={form.section}
      />
      <select
        className="field"
        name="classTeacherId"
        onChange={update}
        required
        value={form.classTeacherId}
      >
        <option value="">Select teacher</option>
        {teachers.map((teacher) => (
          <option key={teacher._id} value={teacher._id}>
            {teacher.name} ({teacher.email})
          </option>
        ))}
      </select>
      <button className="button-primary" disabled={busy} type="submit">
        {busy ? "Creating..." : "Create class"}
      </button>
    </form>
  );
}
