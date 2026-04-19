import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiBox, FiShoppingBag, FiUsers, FiArrowLeft } from 'react-icons/fi';

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();
  const links = [
    { to: '/admin', icon: <FiGrid />, label: 'Dashboard' },
    { to: '/admin/products', icon: <FiBox />, label: 'Products' },
    { to: '/admin/orders', icon: <FiShoppingBag />, label: 'Orders' },
    { to: '/admin/users', icon: <FiUsers />, label: 'Users' }
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <FiArrowLeft /> Back to Store
        </Link>
        <h3>Admin Panel</h3>
        {links.map(l => (
          <Link key={l.to} to={l.to} className={pathname === l.to ? 'active' : ''}>{l.icon} {l.label}</Link>
        ))}
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
