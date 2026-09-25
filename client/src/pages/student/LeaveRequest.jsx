import { useEffect, useState } from "react";
import LeaveForm from "../../components/LeaveForm";
import LeaveBalanceGrid from "../../components/LeaveBalanceGrid";
import LeaveTable from "../../components/LeaveTable";
import api from "../../services/api";

export default function LeaveRequest() {
  const [balances, setBalances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function load() {
    const [balanceResponse, leaveResponse] = await Promise.all([
      api.get("/student/leave-balance"),
      api.get("/student/leave"),
    ]);
    setBalances(balanceResponse.data.data);
    setLeaves(leaveResponse.data.data);
  }
  async function submit(form) {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const { data } = await api.post("/student/leave", form);
      setLeaves([data.data, ...leaves]);
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit leave request");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load()
      .catch((err) =>
        setError(
          err.response?.data?.message || "Unable to load leave dashboard",
        ),
      )
      .finally(() => setLoading(false));
  }, []);
  return (
    <section>
      <div className="mb-6">
        <h2 className="page-title">Request leave</h2>
        <p className="page-subtitle">
          Check your balance, submit leave, and track its review status.
        </p>
      </div>
      <LeaveBalanceGrid balances={balances} loading={loading} />
      <div className="panel">
        <LeaveForm busy={busy} onSubmit={submit} />
      </div>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <div className="panel mt-6">
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
