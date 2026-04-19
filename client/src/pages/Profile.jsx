import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '../store/slices/authSlice';
import { fetchOrders } from '../store/slices/orderSlice';
import { FiUser, FiMail, FiPhone, FiPackage, FiCalendar } from 'react-icons/fi';

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { orders, loading } = useSelector(s => s.orders);

  useEffect(() => {
    dispatch(getProfile());
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <div className="container fade-in">
      <div className="page-header"><h1>My Account</h1></div>

      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="avatar">{user?.name?.charAt(0)}</div>
          <div className="name">{user?.name}</div>
          <div className="email">{user?.email}</div>
          <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <FiMail size={14} /> {user?.email}
            </div>
            {user?.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <FiPhone size={14} /> {user.phone}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <FiCalendar size={14} /> Joined {new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div>
          {/* Orders */}
          <h2 style={{ marginBottom: 20 }}><FiPackage style={{ verticalAlign: 'middle' }} /> Order History</h2>
          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📦</div>
              <h3>No orders yet</h3>
              <p className="text-muted">Start shopping to see your orders here</p>
            </div>
          ) : (
            <div>
              {orders.map(order => (
                <Link to={`/orders/${order._id}`} key={order._id} className="card" style={{ padding: 20, marginBottom: 16, display: 'block' }}>
                  <div className="flex-between" style={{ marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order #{order._id.slice(-8).toUpperCase()}</span>
                      <span style={{ marginLeft: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {order.items?.slice(0, 3).map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <img src={item.image || item.product?.images?.[0]?.url || ''} alt="" style={{ width: 50, height: 50, borderRadius: 6, objectFit: 'cover' }} />
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.name || item.product?.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {order.items?.length > 3 && <span style={{ alignSelf: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>+{order.items.length - 3} more</span>}
                  </div>
                  <div style={{ marginTop: 12, textAlign: 'right', fontWeight: 700 }}>₹{order.totalAmount?.toLocaleString()}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
