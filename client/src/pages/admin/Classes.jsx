import { useEffect, useState } from "react";
import api from "../../services/api";
import ClassForm from "../../components/ClassForm";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const [classResponse, teacherResponse] = await Promise.all([
      api.get("/admin/classes"),
      api.get("/admin/teachers"),
    ]);
    setClasses(classResponse.data.data);
    setTeachers(teacherResponse.data.data);
  }
  useEffect(() => {
    load().catch((err) =>
      setError(err.response?.data?.message || "Unable to load classes"),
    );
  }, []);
  async function createClass(form) {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const { data } = await api.post("/admin/classes", form);
      setClasses([...classes, data.data]);
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create class");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <div className="mb-6">
        <h2 className="page-title">Class sections</h2>
        <p className="page-subtitle">Create a class and assign its teacher.</p>
      </div>
      <div className="panel">
        <ClassForm busy={busy} onSubmit={createClass} teachers={teachers} />
      </div>
      <Feedback error={error} message={message} />
      <div className="panel mt-6 overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Section</th>
              <th>Class teacher</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((item) => (
              <tr key={item._id}>
                <td>{item.grade}</td>
                <td>{item.section}</td>
                <td>{item.classTeacherId?.name || "Unassigned"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Feedback({ error, message }) {
  return (
    <>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </>
  );
}
