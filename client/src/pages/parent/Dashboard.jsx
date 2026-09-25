import { useEffect, useState } from "react";
import DashboardCard from "../../components/DashboardCard";
import AttendanceOverviewCard from "../../components/AttendanceOverviewCard";
import EmptyState from "../../components/EmptyState";
import LeaveBalanceGrid from "../../components/LeaveBalanceGrid";
import LeaveTable from "../../components/LeaveTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import PageLayout from "../../components/PageLayout";
import WeekStatusStrip from "../../components/WeekStatusStrip";
import AlertBanner from "../../components/AlertBanner";
import api from "../../services/api";
import { AttendanceTrend, MetricBar } from "../../components/Analytics";

export default function Dashboard() {
  const date = new Date();
  const [children, setChildren] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [attendance, setAttendance] = useState(null);
  const [balances, setBalances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [warnings, setWarnings] = useState([]);
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
      );
  }, []);
  useEffect(() => {
    if (!studentId) return;
    Promise.all([
      api.get("/parent/attendance", {
        params: {
          studentId,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        },
      }),
      api.get("/parent/leave-balance", { params: { studentId } }),
      api.get("/parent/leave", { params: { studentId } }),
      api.get("/parent/attendance/alerts", { params: { studentId } }),
    ])
      .then(
        ([
          attendanceResponse,
          balanceResponse,
          leaveResponse,
          alertResponse,
        ]) => {
          setAttendance(attendanceResponse.data.data);
          setBalances(balanceResponse.data.data);
          setLeaves(leaveResponse.data.data);
          setWarnings(alertResponse.data.data.warnings);
        },
      )
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load dashboard"),
      );
  }, [studentId]);
  const child = children.find((item) => item._id === studentId);
  const counts = ["present", "absent", "late", "leave"].map((status) => ({
    label: status[0].toUpperCase() + status.slice(1),
    value:
      attendance?.records?.filter((record) => record.status === status)
        .length || 0,
    color: {
      present: "text-[#0F766E]",
      absent: "text-[#D9485F]",
      late: "text-[#C77D0A]",
      leave: "text-[#6D5BD0]",
    }[status],
  }));
  return (
    <PageLayout>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="overview-kicker">Parent overview</p>
          <h1 className="overview-title">
            Stay close to your child’s progress
          </h1>
        </div>
        <select
          className="field max-w-xs"
          onChange={(event) => setStudentId(event.target.value)}
          value={studentId}
        >
          <option value="">Select child</option>
          {children.map((item) => (
            <option key={item._id} value={item._id}>
              {item.userId?.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="error-message">{error}</p>}
      {!attendance && !error ? (
        <LoadingSpinner />
      ) : attendance ? (
        <>
          <AlertBanner warnings={warnings} />
          <AttendanceOverviewCard
            attendance={attendance}
            detailsPath="/parent/attendance"
            summary={counts}
            title={
              child
                ? `${child.userId?.name}'s monthly attendance`
                : "Monthly attendance"
            }
          />
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <AttendanceTrend
              records={attendance.records}
              title="Attendance rhythm"
            />
            <DashboardCard title="Leave usage">
              <div className="space-y-5">
                {balances.length ? (
                  balances.map((balance) => (
                    <MetricBar
                      key={balance.leaveType}
                      label={balance.leaveType}
                      value={balance.used}
                      total={balance.totalAllotted}
                      color="#6D5BD0"
                      detail={`${balance.used} used � ${balance.remaining} remaining`}
                    />
                  ))
                ) : (
                  <p className="text-sm text-[#5B7590]">
                    No leave balance information yet.
                  </p>
                )}
              </div>
            </DashboardCard>
          </div>
          <WeekStatusStrip records={attendance.records} />
          <LeaveBalanceGrid balances={balances} loading={false} />
          <DashboardCard title="Recent leave requests">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5B7590]">Read-only history</span>
              <a
                className="text-sm font-medium text-[#2563EB]"
                href="/parent/leave"
              >
                Open leave records →
              </a>
            </div>
            {leaves.length ? (
              <LeaveTable leaves={[leaves[0]]} />
            ) : (
              <EmptyState title="No leave requests" />
            )}
          </DashboardCard>
        </>
      ) : (
        <EmptyState />
      )}
    </PageLayout>
  );
}
