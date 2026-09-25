import { useEffect, useState } from "react";
import PageLayout from "../../components/PageLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import api from "../../services/api";
import toast from "react-hot-toast";
import ProgressBar from "../../components/ProgressBar";

function parseCsv(csv) {
  return csv
    .trim()
    .split(/\r?\n/)
    .map((line) => {
      const values = [];
      let value = "";
      let quoted = false;
      for (let index = 0; index < line.length; index += 1) {
        const character = line[index];
        if (character === '"' && line[index + 1] === '"' && quoted) {
          value += '"';
          index += 1;
        } else if (character === '"') quoted = !quoted;
        else if (character === "," && !quoted) {
          values.push(value);
          value = "";
        } else value += character;
      }
      values.push(value);
      return values;
    });
}

export default function AttendanceReport() {
  const now = new Date();
  const [classes, setClasses] = useState([]);
  const [classSectionId, setClassSectionId] = useState("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
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
      );
  }, []);
  async function loadReport() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/teacher/reports/attendance", {
        params: { classSectionId, month, year },
        responseType: "text",
      });
      setRows(parseCsv(data));
      toast.success("Report preview loaded");
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load report";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }
  async function download() {
    try {
      const { data } = await api.get("/teacher/reports/attendance", {
        params: { classSectionId, month, year },
        responseType: "blob",
      });
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "attendance-report.csv";
      link.click();
      URL.revokeObjectURL(url);
      toast.success("CSV download started");
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to download report";
      setError(message);
      toast.error(message);
    }
  }
  const reportRows = rows.slice(1).map((row) => ({
    name: row[0],
    rollNo: row[1],
    percentage: Number(row[2]) || 0,
    present: Number(row[3]) || 0,
    absent: Number(row[4]) || 0,
    late: Number(row[5]) || 0,
    leave: Number(row[6]) || 0,
  }));
  const totals = reportRows.reduce(
    (result, row) => ({
      absent: result.absent + row.absent,
      late: result.late + row.late,
      leave: result.leave + row.leave,
      percentage: result.percentage + row.percentage,
    }),
    { absent: 0, late: 0, leave: 0, percentage: 0 },
  );
  const average = reportRows.length
    ? (totals.percentage / reportRows.length).toFixed(1)
    : "0.0";
  return (
    <PageLayout>
      <div className="mb-5">
        <p className="text-xs font-medium text-[#2563EB]">Teacher reports</p>
        <div className="mt-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <h1 className="page-title">Monthly attendance report</h1>
          <p className="text-xs text-[#5B7590]">
            {new Date(year, month - 1).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
            {classes.find((item) => item._id === classSectionId)
              ? ` · ${classes.find((item) => item._id === classSectionId).grade} - ${classes.find((item) => item._id === classSectionId).section}`
              : ""}
          </p>
        </div>
      </div>
      <div className="panel mb-4 p-3">
        <div className="grid gap-2 md:grid-cols-[1.1fr_1.1fr_0.8fr_auto_auto]">
          <select
            className="field"
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
          <select
            className="field"
            onChange={(event) => setMonth(Number(event.target.value))}
            value={month}
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {new Date(2000, index).toLocaleString("default", {
                  month: "long",
                })}
              </option>
            ))}
          </select>
          <input
            className="field"
            max="2100"
            min="2000"
            onChange={(event) => setYear(Number(event.target.value))}
            type="number"
            value={year}
          />
          <button
            className="button-primary"
            disabled={!classSectionId || loading}
            onClick={loadReport}
            type="button"
          >
            {loading ? "Loading..." : "Preview"}
          </button>
          <button
            className="button-secondary"
            disabled={!classSectionId}
            onClick={download}
            type="button"
          >
            CSV download
          </button>
        </div>
      </div>
      {error && <p className="error-message">{error}</p>}
      {reportRows.length > 0 && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Class average" tone="blue" value={`${average}%`} />
          <Metric label="Absent days" tone="red" value={totals.absent} />
          <Metric label="Late days" tone="orange" value={totals.late} />
          <Metric label="Leave days" tone="purple" value={totals.leave} />
        </div>
      )}
      <div className="panel overflow-x-auto p-2">
        {loading ? (
          <LoadingSpinner />
        ) : reportRows.length ? (
          <table className="data-table min-w-[820px] table-fixed">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[15%]" />
              <col className="w-[23%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll no</th>
                <th>Attendance</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Leave</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.map((row) => (
                <tr key={row.rollNo}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DBE7FD] text-xs font-medium text-[#1E40AF]">
                        {row.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                      {row.name}
                    </div>
                  </td>
                  <td className="text-[#5B7590]">{row.rollNo}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <ProgressBar
                        tone={row.percentage < 90 ? "orange" : "teal"}
                        value={row.percentage}
                      />
                      <span className="min-w-12 text-right text-xs font-medium">
                        {row.percentage.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <Count value={row.present} tone="teal" />
                  <Count value={row.absent} tone="red" />
                  <Count value={row.late} tone="orange" />
                  <Count value={row.leave} tone="purple" />
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            title="No report preview"
            message="Choose a class and period, then select Preview."
          />
        )}
      </div>
    </PageLayout>
  );
}

function Metric({ label, tone, value }) {
  const colors = {
    blue: "text-[#2563EB]",
    red: "text-[#D9485F]",
    orange: "text-[#C77D0A]",
    purple: "text-[#6D5BD0]",
  };
  return (
    <div className="panel p-3">
      <p className="text-xs text-[#5B7590]">{label}</p>
      <p className={`mt-1 text-2xl font-medium ${colors[tone]}`}>{value}</p>
    </div>
  );
}
function Count({ value, tone }) {
  const colors = {
    teal: "bg-[#DDF5F1] text-[#0F766E]",
    red: "bg-[#FDE4E8] text-[#9F1F35]",
    orange: "bg-[#FDF0D5] text-[#8A5300]",
    purple: "bg-[#ECE8FB] text-[#4C3BA8]",
  };
  return (
    <td>
      <span
        className={`inline-block min-w-7 rounded-full px-2 py-0.5 text-center text-xs font-medium ${colors[tone]}`}
      >
        {value}
      </span>
    </td>
  );
}
