import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { FiUsers, FiBox, FiShoppingBag, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import API from '../../utils/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="loader"><div className="spinner" /></div></AdminLayout>;

  const stats = [
    { icon: <FiDollarSign />, label: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString()}` },
    { icon: <FiShoppingBag />, label: 'Total Orders', value: data?.totalOrders || 0 },
    { icon: <FiBox />, label: 'Total Products', value: data?.totalProducts || 0 },
    { icon: <FiUsers />, label: 'Total Users', value: data?.totalUsers || 0 }
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const maxSale = Math.max(...(data?.monthlySales?.map(m => m.total) || [1]));

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 24 }}>📊 Dashboard</h1>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Sales Chart */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20 }}><FiTrendingUp style={{ verticalAlign: 'middle' }} /> Monthly Sales</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200, padding: '0 8px' }}>
            {data?.monthlySales?.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>₹{(m.total / 1000).toFixed(0)}k</span>
                <div style={{
                  width: '100%', borderRadius: '4px 4px 0 0',
                  height: `${Math.max((m.total / maxSale) * 160, 8)}px`,
                  background: 'var(--gradient-1)', transition: 'var(--transition)'
                }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{months[m._id.month - 1]}</span>
              </div>
            )) || <p className="text-muted">No sales data</p>}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20 }}>Order Status</h3>
          {data?.statusBreakdown?.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span className={`badge badge-${s._id}`}>{s._id}</span>
              <span style={{ fontWeight: 700 }}>{s.count}</span>
            </div>
          )) || <p className="text-muted">No orders yet</p>}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card" style={{ padding: 24, marginTop: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Recent Orders</h3>
        <table className="data-table">
          <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {data?.recentOrders?.map(o => (
              <tr key={o._id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>#{o._id.slice(-8).toUpperCase()}</td>
                <td>{o.user?.name}</td>
                <td style={{ fontWeight: 600 }}>₹{o.totalAmount?.toLocaleString()}</td>
                <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!data?.recentOrders || data.recentOrders.length === 0) && <p className="text-muted" style={{ textAlign: 'center', padding: 20 }}>No orders yet</p>}
      </div>
    </AdminLayout>
  );
}
