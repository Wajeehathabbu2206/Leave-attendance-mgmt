import { useState } from "react";

const initialState = {
  name: "",
  email: "",
  password: "",
  rollNo: "",
  classSectionId: "",
};

export default function StudentForm({ classes, onSubmit, busy }) {
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
    <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
      <input
        className="field"
        name="name"
        onChange={update}
        placeholder="Student name"
        required
        value={form.name}
      />
      <input
        className="field"
        name="email"
        onChange={update}
        placeholder="Email"
        required
        type="email"
        value={form.email}
      />
      <input
        className="field"
        minLength="8"
        name="password"
        onChange={update}
        placeholder="Temporary password"
        required
        type="password"
        value={form.password}
      />
      <input
        className="field"
        name="rollNo"
        onChange={update}
        placeholder="Roll number"
        required
        value={form.rollNo}
      />
      <select
        className="field md:col-span-2"
        name="classSectionId"
        onChange={update}
        required
        value={form.classSectionId}
      >
        <option value="">Select class-section</option>
        {classes.map((item) => (
          <option key={item._id} value={item._id}>
            {item.grade} - {item.section}
          </option>
        ))}
      </select>
      <button
        className="button-primary md:col-span-2"
        disabled={busy}
        type="submit"
      >
        {busy ? "Creating..." : "Create student"}
      </button>
    </form>
  );
}
