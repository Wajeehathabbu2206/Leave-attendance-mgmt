import { Navigate, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import NotAuthorized from '../pages/NotAuthorized';
import RoleDashboard from '../pages/RoleDashboard';
import Register from '../pages/Register';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../pages/admin/AdminLayout';
import Classes from '../pages/admin/Classes';
import Students from '../pages/admin/Students';
import Parents from '../pages/admin/Parents';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/not-authorized" element={<NotAuthorized />} />
      <Route element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']} />}>
        <Route path="/dashboard" element={<Home />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="classes" replace />} />
          <Route path="classes" element={<Classes />} />
          <Route path="students" element={<Students />} />
          <Route path="parents" element={<Parents />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route path="/teacher/*" element={<RoleDashboard role="teacher" />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student/*" element={<RoleDashboard role="student" />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
        <Route path="/parent/*" element={<RoleDashboard role="parent" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
