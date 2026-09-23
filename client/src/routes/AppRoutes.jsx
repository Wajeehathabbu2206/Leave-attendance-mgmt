import { Navigate, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import NotAuthorized from '../pages/NotAuthorized';
import RoleDashboard from '../pages/RoleDashboard';
import Register from '../pages/Register';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/not-authorized" element={<NotAuthorized />} />
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/*" element={<RoleDashboard role="admin" />} />
        <Route path="/admin/register" element={<Register />} />
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
