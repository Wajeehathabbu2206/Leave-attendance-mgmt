import { Navigate, Route, Routes } from "react-router-dom";
import DashboardHome from "../pages/DashboardHome";
import Login from "../pages/Login";
import NotAuthorized from "../pages/NotAuthorized";
import RoleDashboard from "../pages/RoleDashboard";
import Register from "../pages/Register";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../pages/admin/AdminLayout";
import Classes from "../pages/admin/Classes";
import Students from "../pages/admin/Students";
import Parents from "../pages/admin/Parents";
import MarkAttendance from "../pages/teacher/MarkAttendance";
import MyAttendance from "../pages/student/MyAttendance";
import ChildAttendance from "../pages/parent/ChildAttendance";
import LeaveRequest from "../pages/student/LeaveRequest";
import LeaveRequests from "../pages/teacher/LeaveRequests";
import LeaveRecords from "../pages/parent/LeaveRecords";
import StudentLeaveDashboard from "../pages/student/LeaveDashboard";
import ParentLeaveDashboard from "../pages/parent/LeaveDashboard";
import AdminDashboard from "../pages/admin/Dashboard";
import TeacherDashboard from "../pages/teacher/Dashboard";
import AttendanceReport from "../pages/teacher/AttendanceReport";
import PageLayout from "../components/PageLayout";
import AttendanceCalendarPage from "../pages/student/AttendanceCalendarPage";
import StudentTimetablePage from "../pages/student/TimetablePage";
import TeacherTimetablePage from "../pages/teacher/TimetablePage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/not-authorized" element={<NotAuthorized />} />
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["admin", "teacher", "student", "parent"]}
          />
        }
      >
        <Route path="/dashboard" element={<DashboardHome />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="classes" replace />} />
          <Route path="classes" element={<Classes />} />
          <Route path="students" element={<Students />} />
          <Route path="parents" element={<Parents />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route
          path="/teacher/attendance"
          element={
            <PageLayout>
              <MarkAttendance />
            </PageLayout>
          }
        />
        <Route path="/teacher/timetable" element={<TeacherTimetablePage />} />
        <Route
          path="/teacher/leave"
          element={
            <PageLayout>
              <LeaveRequests />
            </PageLayout>
          }
        />
        <Route
          path="/teacher/reports/attendance"
          element={<AttendanceReport />}
        />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route
          path="/student/attendance"
          element={
            <PageLayout>
              <MyAttendance />
            </PageLayout>
          }
        />
        <Route
          path="/student/attendance/calendar"
          element={<AttendanceCalendarPage />}
        />
        <Route path="/student/timetable" element={<StudentTimetablePage />} />
        <Route
          path="/student/leave"
          element={
            <PageLayout>
              <StudentLeaveDashboard />
            </PageLayout>
          }
        />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["parent"]} />}>
        <Route
          path="/parent/attendance"
          element={
            <PageLayout>
              <ChildAttendance />
            </PageLayout>
          }
        />
        <Route
          path="/parent/leave"
          element={
            <PageLayout>
              <ParentLeaveDashboard />
            </PageLayout>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
