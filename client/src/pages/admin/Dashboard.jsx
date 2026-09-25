import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardCard from "../../components/DashboardCard";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import PageLayout from "../../components/PageLayout";
import StatCard from "../../components/StatCard";
import api from "../../services/api";
import { StatusBreakdown, MetricBar } from "../../components/Analytics";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then(({ data: response }) => setData(response.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load dashboard"),
      );
  }, []);
  return (
    <PageLayout>
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600">Admin overview</p>
        <h1 className="page-title mt-1">School operations at a glance</h1>
      </div>
      {error && <p className="error-message">{error}</p>}
      {!data && !error ? (
        <LoadingSpinner />
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total students"
              tone="blue"
              value={data.totalStudents}
            />
            <StatCard
              label="Total teachers"
              tone="purple"
              value={data.totalTeachers}
            />
            <StatCard
              detail="Today"
              label="Attendance"
              tone="green"
              value={`${data.overallAttendancePercentage}%`}
            />
            <StatCard
              label="Pending leaves"
              tone="yellow"
              value={data.pendingLeaveRequests}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <StatusBreakdown
              summary={data.attendanceSummary}
              total={data.totalStudents}
              title="School attendance today"
            />
            <DashboardCard title="Daily coverage">
              <div className="space-y-5">
                <MetricBar
                  label="Students marked"
                  value={data.totalMarked || 0}
                  total={data.totalStudents}
                  detail={`${data.totalMarked || 0} of ${data.totalStudents} students`}
                  color="#2563EB"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-[#F6FAFD] p-3">
                    <p className="text-xs text-[#5B7590]">Classes</p>
                    <p className="mt-1 text-xl font-semibold text-[#0B1F3A]">
                      {data.totalClasses ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#F6FAFD] p-3">
                    <p className="text-xs text-[#5B7590]">Attendance rate</p>
                    <p className="mt-1 text-xl font-semibold text-[#0F766E]">
                      {data.overallAttendancePercentage}%
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#5B7590]">
                  Attendance rate uses present and late records among marked
                  students.
                </p>
              </div>
            </DashboardCard>
          </div>
          <DashboardCard title="Quick links">
            <div className="flex flex-wrap gap-3">
              <Link className="button-primary" to="/admin/classes">
                Manage classes
              </Link>
              <Link className="button-secondary" to="/admin/students">
                Manage students
              </Link>
              <Link className="button-secondary" to="/admin/parents">
                Manage parents
              </Link>
            </div>
          </DashboardCard>
        </>
      ) : (
        <EmptyState />
      )}
    </PageLayout>
  );
}
