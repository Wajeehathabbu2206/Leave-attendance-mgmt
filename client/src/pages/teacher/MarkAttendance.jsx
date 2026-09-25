import { useEffect, useState } from "react";
import AttendanceTable from "../../components/AttendanceTable";
import api from "../../services/api";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function MarkAttendance() {
  const [classes, setClasses] = useState([]);
  const [classSectionId, setClassSectionId] = useState("");
  const [date, setDate] = useState(today());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/teacher/classes")
      .then(({ data }) => {
        setClasses(data.data);
        setClassSectionId(data.data[0]?._id || "");
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load classes"),
      )
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!classSectionId || !date) return;
    setLoading(true);
    api
      .get("/teacher/attendance", { params: { classSectionId, date } })
      .then(({ data }) => setRecords(data.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load roster"),
      )
      .finally(() => setLoading(false));
  }, [classSectionId, date]);
  function updateRecord(studentId, key, value) {
    setRecords((current) =>
      current.map((record) =>
        record.studentId === studentId ? { ...record, [key]: value } : record,
      ),
    );
  }
  async function save() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const { data } = await api.post("/teacher/attendance", {
        classSectionId,
        date,
        records: records
          .filter((record) => record.status !== "unmarked")
          .map(({ studentId, status, remarks }) => ({
            studentId,
            status,
            remarks,
          })),
      });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save attendance");
    } finally {
      setSaving(false);
    }
  }
  return (
    <section>
      <div className="mb-6">
        <h2 className="page-title">Mark attendance</h2>
        <p className="page-subtitle">
          Record attendance for your assigned class.
        </p>
      </div>
      <div className="panel">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Class
            <select
              className="field mt-2"
              onChange={(event) => setClassSectionId(event.target.value)}
              value={classSectionId}
            >
              <option value="">Select class</option>
              {classes.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.grade} - {item.section}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Date
            <input
              className="field mt-2"
              onChange={(event) => setDate(event.target.value)}
              type="date"
              value={date}
            />
          </label>
        </div>
      </div>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <div className="panel mt-6">
        {loading ? (
          <p className="py-8 text-center text-slate-500">Loading roster...</p>
        ) : (
          <>
            <AttendanceTable
              editable
              onRemarksChange={(id, value) =>
                updateRecord(id, "remarks", value)
              }
              onStatusChange={(id, value) => updateRecord(id, "status", value)}
              records={records}
            />
            <button
              className="button-primary mt-6"
              disabled={saving || !records.length}
              onClick={save}
              type="button"
            >
              {saving ? "Saving..." : "Save attendance"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
