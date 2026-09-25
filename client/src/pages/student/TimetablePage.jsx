import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import PageLayout from "../../components/PageLayout";
import TimetableGrid from "../../components/TimetableGrid";
import api from "../../services/api";

export default function TimetablePage() {
  const [timetable, setTimetable] = useState(null);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/student/timetable")
      .then(({ data }) => setTimetable(data.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load timetable"),
      );
  }, []);
  async function selectPeriod(period) {
    setSelected(period);
    setAttendance(null);
    setError("");
    try {
      const { data } = await api.get("/student/attendance/period", {
        params: { date, periodNumber: period.periodNumber },
      });
      setAttendance(data.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load period attendance",
      );
    }
  }
  return (
    <PageLayout>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="overview-kicker">Student timetable</p>
          <h1 className="overview-title">Your week at a glance</h1>
          <p className="mt-2 text-xs text-[#5B7590]">
            Select a period to see its attendance.
          </p>
        </div>
        <input
          className="field max-w-xs"
          onChange={(event) => {
            setDate(event.target.value);
            setAttendance(null);
          }}
          type="date"
          value={date}
        />
      </div>
      {error && <p className="error-message">{error}</p>}
      {!timetable && !error ? (
        <LoadingSpinner />
      ) : (
        <>
          <TimetableGrid
            onPeriodClick={selectPeriod}
            timetable={timetable || []}
          />
          {selected && (
            <div className="panel mt-6">
              <p className="text-xs text-[#5B7590]">
                {selected.dayOfWeek} · Period {selected.periodNumber}
              </p>
              <h2 className="mt-1 text-xl font-medium text-[#0B1F3A]">
                {selected.subjectId?.name || "Subject"}
              </h2>
              <p className="mt-1 text-sm text-[#5B7590]">{date}</p>
              {attendance ? (
                <p className={`status-pill status-${attendance.status} mt-5`}>
                  {attendance.status}
                </p>
              ) : (
                <LoadingSpinner label="Loading period attendance..." />
              )}
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
