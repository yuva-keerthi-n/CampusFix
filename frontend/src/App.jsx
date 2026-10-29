import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import { useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Complaints from './pages/Complaints';
import ComplaintDetails from './pages/ComplaintDetails';
import ReportIssue from './pages/ReportIssue';
import AdminManage from './pages/AdminManage';
import NotFound from './pages/NotFound';

// /dashboard shows a different home screen depending on who is logged in.
function DashboardHome() {
  const { user } = useAuth();
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'staff') return <StaffDashboard />;
  return <StudentDashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/complaints/:id" element={<ComplaintDetails />} />
          <Route element={<ProtectedRoute roles={['student']} />}>
            <Route path="/report" element={<ReportIssue />} />
          </Route>
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/manage" element={<AdminManage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
