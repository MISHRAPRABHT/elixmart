import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    API.get('/orders/admin/all', { params }).then(r => { setOrders(r.data.orders); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}/status`, { status });
      toast.success(`Order ${status}`);
      load();
    } catch (err) { toast.error('Failed'); }
  };

  const statuses = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <AdminLayout>
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <h1>Orders</h1>
        <select className="form-input" style={{ width: 'auto', padding: '8px 12px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <div className="loader"><div className="spinner" /></div> : (
        <div className="card">
          <table className="data-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td><Link to={`/orders/${o._id}`} style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>#{o._id.slice(-8).toUpperCase()}</Link></td>
                  <td>{o.user?.name}<br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.user?.email}</span></td>
                  <td>{o.items?.length} items</td>
                  <td style={{ fontWeight: 600 }}>₹{o.totalAmount?.toLocaleString()}</td>
                  <td><span className={`badge ${o.paymentInfo?.status === 'paid' ? 'badge-delivered' : 'badge-placed'}`}>{o.paymentInfo?.status}</span></td>
                  <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>
                    {o.status !== 'delivered' && o.status !== 'cancelled' && (
                      <select className="form-input" style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                        value={o.status} onChange={e => updateStatus(o._id, e.target.value)}>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-muted" style={{ textAlign: 'center', padding: 30 }}>No orders found</p>}
        </div>
      )}
    </AdminLayout>
  );
}
