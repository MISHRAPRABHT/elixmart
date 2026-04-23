import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder, payRemaining } from '../store/slices/orderSlice';
import { FiCheck, FiPackage, FiTruck, FiNavigation, FiCheckCircle, FiXCircle, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../utils/api';

const statusSteps = [
  { key: 'placed', label: 'Order Placed', icon: <FiCheck />, desc: 'Your order has been placed' },
  { key: 'confirmed', label: 'Confirmed', icon: <FiPackage />, desc: 'Order confirmed by seller' },
  { key: 'shipped', label: 'Shipped', icon: <FiTruck />, desc: 'Package is on its way' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: <FiNavigation />, desc: 'Package is nearby' },
  { key: 'delivered', label: 'Delivered', icon: <FiCheckCircle />, desc: 'Package delivered' }
];

export default function OrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, loading } = useSelector(s => s.orders);
  const [payingRemaining, setPayingRemaining] = useState(false);

  useEffect(() => { dispatch(fetchOrder(id)); }, [dispatch, id]);

  const handlePayRemaining = async () => {
    if (!order || order.remainingAmount <= 0) return;
    setPayingRemaining(true);
    try {
      const { data: rpOrder } = await API.post('/payment/create-order', { amount: order.remainingAmount });
      if (rpOrder.mockMode) {
        await dispatch(payRemaining({
          id: order._id,
          paymentData: {
            razorpayOrderId: rpOrder.id,
            razorpayPaymentId: 'pay_mock_' + Date.now(),
            razorpaySignature: 'mock_signature'
          }
        })).unwrap();
        toast.success('Remaining balance paid successfully!');
        setPayingRemaining(false);
        return;
      }
      const { data: keyData } = await API.get('/payment/key');
      const options = {
        key: keyData.key, amount: rpOrder.amount, currency: rpOrder.currency,
        name: 'Elixmart', description: 'Remaining Balance Payment', order_id: rpOrder.id,
        handler: async (response) => {
          try {
            const { data: verification } = await API.post('/payment/verify', response);
            if (verification.verified) {
              await dispatch(payRemaining({
                id: order._id,
                paymentData: {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                }
              })).unwrap();
              toast.success('Remaining balance paid successfully!');
            } else { toast.error('Payment verification failed'); }
          } catch (err) { toast.error('Failed to update payment'); }
          setPayingRemaining(false);
        },
        theme: { color: '#6366f1' }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { setPayingRemaining(false); toast.error('Payment failed'); });
      rzp.open();
    } catch (err) { toast.error(err.message || 'Payment failed'); setPayingRemaining(false); }
  };

  if (loading || !order) return <div className="loader"><div className="spinner" /></div>;

  const currentIdx = statusSteps.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';
  const isAdvance = order.paymentMode === 'advance';
  const hasRemaining = isAdvance && order.remainingAmount > 0;

  return (
    <div className="container fade-in">
      <div className="page-header">
        <Link to="/profile" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: '0.9rem' }}><FiArrowLeft /> Back to Orders</Link>
        <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
        <p className="text-muted" style={{ marginTop: 4 }}>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 30 }}>
        <div>
          {/* Timeline */}
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ marginBottom: 20 }}>Order Tracking</h3>
            {isCancelled ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--danger)' }}>
                <FiXCircle size={48} /><h3 style={{ marginTop: 12 }}>Order Cancelled</h3>
              </div>
            ) : (
              <div className="order-timeline">
                {statusSteps.map((step, i) => {
                  const isCompleted = i <= currentIdx;
                  const isActive = i === currentIdx;
                  const historyEntry = order.statusHistory?.find(h => h.status === step.key);
                  return (
                    <div key={step.key} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                      <div className="timeline-dot">{step.icon}</div>
                      <div className="timeline-content">
                        <h4 style={{ color: isCompleted ? 'var(--text)' : 'var(--text-muted)' }}>{step.label}</h4>
                        <p>{isCompleted && historyEntry ? new Date(historyEntry.timestamp).toLocaleString() : step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {order.trackingNumber && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 12 }}>Tracking: <strong>{order.trackingNumber}</strong></p>}
          </div>

          {/* Items */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Items ({order.items?.length})</h3>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <img src={item.image || item.product?.images?.[0]?.url || ''} alt="" style={{ width: 70, height: 70, borderRadius: 8, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600 }}>{item.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Qty: {item.quantity}</p>
                </div>
                <p style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="row"><span>Status</span><span className={`badge badge-${order.status}`}>{order.status}</span></div>
            <div className="row"><span>Payment</span><span className={`badge badge-${order.paymentInfo?.status === 'paid' ? 'delivered' : order.paymentInfo?.status === 'partial' ? 'shipped' : 'placed'}`}>{order.paymentInfo?.status}</span></div>
            {isAdvance && <div className="row"><span>Payment Mode</span><span className="badge badge-shipped">Advance</span></div>}
            <div className="row"><span>Items Total</span><span>₹{order.itemsTotal?.toLocaleString()}</span></div>
            <div className="row"><span>Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost}`}</span></div>
            <div className="row"><span>Tax</span><span>₹{order.tax?.toLocaleString()}</span></div>
            <div className="total"><span>Total</span><span>₹{order.totalAmount?.toLocaleString()}</span></div>

            {isAdvance && (
              <>
                <div style={{ borderTop: '1px dashed var(--border)', margin: '12px 0', paddingTop: 12 }}>
                  <div className="row" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    <span>Advance Paid</span><span>₹{order.advanceAmount?.toLocaleString()}</span>
                  </div>
                  <div className="row" style={{ color: hasRemaining ? 'var(--danger, #ef4444)' : 'var(--accent)', fontWeight: 600 }}>
                    <span>Remaining</span><span>{hasRemaining ? `₹${order.remainingAmount?.toLocaleString()}` : '₹0 (Paid)'}</span>
                  </div>
                  {order.remainingPaidAt && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Remaining paid on {new Date(order.remainingPaidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>

                {hasRemaining && (
                  <button
                    className="btn btn-primary btn-block"
                    onClick={handlePayRemaining}
                    disabled={payingRemaining}
                    style={{ marginTop: 12, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', fontWeight: 600 }}
                  >
                    {payingRemaining ? 'Processing...' : `💰 Pay Remaining ₹${order.remainingAmount?.toLocaleString()}`}
                  </button>
                )}
              </>
            )}

            {order.estimatedDelivery && (
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--accent)', marginTop: 12 }}>
                Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
              </p>
            )}
          </div>

          <div className="card" style={{ padding: 20, marginTop: 16 }}>
            <h4 style={{ marginBottom: 12, fontSize: '0.95rem' }}>Shipping Address</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.8 }}>
              {order.shippingAddress?.fullName}<br/>
              {order.shippingAddress?.street}<br/>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zipCode}<br/>
              Phone: {order.shippingAddress?.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

