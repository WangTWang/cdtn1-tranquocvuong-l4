import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import TicketListPage from './pages/TicketListPage.jsx';
import AssignPage from './pages/AssignPage.jsx';
import AppointmentListPage from './pages/AppointmentListPage.jsx';
import AppointmentPage from './pages/AppointmentPage.jsx';
import MyTicketsPage from './pages/MyTicketsPage.jsx';

export const HOME = { QUAN_LY: '/tickets', TIEP_NHAN: '/appointments', KY_THUAT_VIEN: '/my-tickets' };

// Chi cho vao khi da dang nhap va dung vai tro; sai vai tro thi ve trang chinh cua vai tro do.
function Protected({ roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={HOME[user.role]} replace />;
  return <Layout><Outlet /></Layout>;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={HOME[user.role]} replace /> : <LoginPage />} />
      <Route element={<Protected roles={['QUAN_LY']} />}>
        <Route path="/tickets" element={<TicketListPage />} />
        <Route path="/tickets/:ticketId/assign" element={<AssignPage />} />
      </Route>
      <Route element={<Protected roles={['TIEP_NHAN']} />}>
        <Route path="/appointments" element={<AppointmentListPage />} />
        <Route path="/tickets/:ticketId/appointment" element={<AppointmentPage />} />
      </Route>
      <Route element={<Protected roles={['KY_THUAT_VIEN']} />}>
        <Route path="/my-tickets" element={<MyTicketsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? HOME[user.role] : '/login'} replace />} />
    </Routes>
  );
}
