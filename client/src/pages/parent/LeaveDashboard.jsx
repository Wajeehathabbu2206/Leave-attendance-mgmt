import { useEffect, useState } from "react";
import LeaveBalanceGrid from "../../components/LeaveBalanceGrid";
import LeaveTable from "../../components/LeaveTable";
import api from "../../services/api";

export default function LeaveDashboard() {
  const [children, setChildren] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [balances, setBalances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/parent/children")
      .then(({ data }) => {
        setChildren(data.data);
        setStudentId(data.data[0]?._id || "");
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load children"),
      )
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    Promise.all([
      api.get("/parent/leave-balance", { params: { studentId } }),
      api.get("/parent/leave", { params: { studentId } }),
    ])
      .then(([balanceResponse, leaveResponse]) => {
        setBalances(balanceResponse.data.data);
        setLeaves(leaveResponse.data.data);
      })
      .catch((err) =>
        setError(
          err.response?.data?.message || "Unable to load leave dashboard",
        ),
      )
      .finally(() => setLoading(false));
  }, [studentId]);
  return (
    <section>
      <div className="mb-6">
        <h2 className="page-title">Child leave dashboard</h2>
        <p className="page-subtitle">
          View leave balances and history for a linked child.
        </p>
      </div>
      <div className="panel mb-6">
        <label className="text-sm font-semibold text-slate-700">
          Child
          <select
            className="field mt-2 max-w-md"
            onChange={(event) => setStudentId(event.target.value)}
            value={studentId}
          >
            <option value="">Select child</option>
            {children.map((child) => (
              <option key={child._id} value={child._id}>
                {child.userId?.name} ({child.classSectionId?.grade}-
                {child.classSectionId?.section})
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className="error-message">{error}</p>}
      <LeaveBalanceGrid balances={balances} loading={loading} />
      <div className="panel">
        <h3 className="mb-4 text-lg font-bold">Leave history</h3>
        {loading ? (
          <p className="py-8 text-center text-slate-500">
            Loading leave history...
          </p>
        ) : (
          <LeaveTable leaves={leaves} />
        )}
      </div>
    </section>
  );
}
