import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { ROLE_LABEL } from '../format.js';

const NAV = {
  QUAN_LY: [{ to: '/tickets', text: 'Phiếu bảo hành' }],
  TIEP_NHAN: [{ to: '/appointments', text: 'Đặt lịch hẹn' }],
  KY_THUAT_VIEN: [{ to: '/my-tickets', text: 'Phiếu của tôi' }],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="page">
      <header className="topbar">
        <strong>Mekong Mobile · Phân công kỹ thuật viên</strong>
        <nav>
          {NAV[user.role].map((n) => <NavLink key={n.to} to={n.to}>{n.text}</NavLink>)}
        </nav>
        <span className="who">
          {user.fullName} ({ROLE_LABEL[user.role]}) <button type="button" onClick={logout}>Đăng xuất</button>
        </span>
      </header>
      <main>{children}</main>
    </div>
  );
}
