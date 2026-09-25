import { useEffect, useState } from "react";
import StatusToggle from "../../components/StatusToggle";
import LoadingSpinner from "../../components/LoadingSpinner";
import PageLayout from "../../components/PageLayout";
import TimetableGrid from "../../components/TimetableGrid";
import api from "../../services/api";
import toast from "react-hot-toast";

const emptyPeriod = { periodNumber: 1, subjectName: "", subjectCode: "" };

export default function TimetablePage() {
  const [timetable, setTimetable] = useState(null);
  const [classes, setClasses] = useState([]);
  const [classSectionId, setClassSectionId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("Mon");
  const [periodRows, setPeriodRows] = useState([emptyPeriod]);
  const [selected, setSelected] = useState(null);
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function loadTimetable() {
    const { data } = await api.get("/teacher/timetable");
    setTimetable(data.data);
  }
  useEffect(() => {
    Promise.all([api.get("/teacher/timetable"), api.get("/teacher/classes")])
      .then(([timetableResponse, classResponse]) => {
        setTimetable(timetableResponse.data.data);
        setClasses(classResponse.data.data);
        setClassSectionId(classResponse.data.data[0]?._id || "");
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load timetable"),
      )
      .finally(() => setLoading(false));
  }, []);
  async function selectPeriod(period) {
    setSelected(period);
    setError("");
    try {
      const { data } = await api.get("/teacher/attendance", {
        params: { classSectionId: period.classSectionId._id, date },
      });
      setRecords(
        data.data.map((record) => ({
          ...record,
          status: record.status === "unmarked" ? "present" : record.status,
        })),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load class roster");
    }
  }
  function updateStatus(studentId, status) {
    setRecords((current) =>
      current.map((record) =>
        record.studentId === studentId ? { ...record, status } : record,
      ),
    );
  }
  async function save() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const { data } = await api.post("/teacher/attendance/period", {
        classSectionId: selected.classSectionId._id,
        date,
        periodNumber: selected.periodNumber,
        records: records.map(({ studentId, status }) => ({
          studentId,
          status,
        })),
      });
      setMessage(data.message);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save period attendance",
      );
    } finally {
      setSaving(false);
    }
  }
  async function saveTimetable(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api.post("/teacher/timetable", {
        classSectionId,
        dayOfWeek,
        periods: periodRows,
      });
      await loadTimetable();
      setMessage("Timetable saved");
      toast.success("Timetable saved");
    } catch (err) {
      const nextError =
        err.response?.data?.message || "Unable to save timetable";
      setError(nextError);
      toast.error(nextError);
    } finally {
      setSaving(false);
    }
  }
  function updatePeriod(index, field, value) {
    setPeriodRows((current) =>
      current.map((period, periodIndex) =>
        periodIndex === index
          ? {
              ...period,
              [field]: field === "periodNumber" ? Number(value) : value,
            }
          : period,
      ),
    );
  }
  return (
    <PageLayout>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="overview-kicker">Teacher timetable</p>
          <h1 className="overview-title">Build your class week</h1>
        </div>
        <input
          className="field max-w-xs"
          onChange={(event) => setDate(event.target.value)}
          type="date"
          value={date}
        />
      </div>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <form className="panel mb-6" onSubmit={saveTimetable}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Add timetable periods</h2>
            <p className="text-sm text-[#5B7590]">
              Saving a day replaces that day&apos;s existing periods.
            </p>
          </div>
          <button className="button-primary" disabled={saving} type="submit">
            {saving ? "Saving..." : "Save timetable"}
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <select
            className="field"
            onChange={(event) => setClassSectionId(event.target.value)}
            required
            value={classSectionId}
          >
            <option value="">Select assigned class</option>
            {classes.map((item) => (
              <option key={item._id} value={item._id}>
                {item.grade} - {item.section}
              </option>
            ))}
          </select>
          <select
            className="field"
            onChange={(event) => setDayOfWeek(event.target.value)}
            value={dayOfWeek}
          >
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 space-y-3">
          {periodRows.map((period, index) => (
            <div
              className="grid gap-3 rounded-lg border border-[#D6E4F0] bg-[#F8FBFE] p-3 sm:grid-cols-[100px_1fr_150px_auto]"
              key={index}
            >
              <input
                className="field"
                min="1"
                onChange={(event) =>
                  updatePeriod(index, "periodNumber", event.target.value)
                }
                placeholder="Period"
                type="number"
                value={period.periodNumber}
              />
              <input
                className="field"
                onChange={(event) =>
                  updatePeriod(index, "subjectName", event.target.value)
                }
                placeholder="Subject name"
                required
                value={period.subjectName}
              />
              <input
                className="field"
                onChange={(event) =>
                  updatePeriod(index, "subjectCode", event.target.value)
                }
                placeholder="Code"
                required
                value={period.subjectCode}
              />
              {periodRows.length > 1 ? (
                <button
                  className="button-secondary"
                  onClick={() =>
                    setPeriodRows(
                      periodRows.filter((_, rowIndex) => rowIndex !== index),
                    )
                  }
                  type="button"
                >
                  Remove
                </button>
              ) : (
                <span />
              )}
            </div>
          ))}
        </div>
        <button
          className="button-secondary mt-4"
          onClick={() =>
            setPeriodRows([
              ...periodRows,
              { ...emptyPeriod, periodNumber: periodRows.length + 1 },
            ])
          }
          type="button"
        >
          + Add period
        </button>
      </form>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <TimetableGrid
          onPeriodClick={selectPeriod}
          timetable={timetable || []}
        />
      )}
      {selected && (
        <div className="panel mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">
                Period {selected.periodNumber} · {selected.subjectId?.name}
              </h2>
              <p className="text-sm text-[#5B7590]">
                {selected.dayOfWeek} · {date}
              </p>
            </div>
            <button
              className="text-xl text-[#5B7590]"
              onClick={() => setSelected(null)}
              type="button"
            >
              ×
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table min-w-[680px]">
              <thead>
                <tr>
                  <th>Roll no</th>
                  <th>Student</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.studentId}>
                    <td>{record.rollNo}</td>
                    <td>{record.name}</td>
                    <td>
                      <StatusToggle
                        onChange={(status) =>
                          updateStatus(record.studentId, status)
                        }
                        value={record.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="button-primary mt-5"
            disabled={saving || !records.length}
            onClick={save}
            type="button"
          >
            {saving ? "Saving..." : "Save period attendance"}
          </button>
        </div>
      )}
    </PageLayout>
  );
}
