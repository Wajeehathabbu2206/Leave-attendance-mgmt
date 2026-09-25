import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./admin/Dashboard";
import TeacherDashboard from "./teacher/Dashboard";
import StudentDashboard from "./student/Dashboard";
import ParentDashboard from "./parent/Dashboard";

export default function DashboardHome() {
  const { user } = useAuth();
  return {
    admin: <AdminDashboard />,
    teacher: <TeacherDashboard />,
    student: <StudentDashboard />,
    parent: <ParentDashboard />,
  }[user.role];
}
