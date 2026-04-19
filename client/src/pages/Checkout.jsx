import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/orderSlice';
import { FiMapPin, FiCreditCard, FiCheck, FiNavigation, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../utils/api';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh',
  'Dadra and Nagar Haveli','Daman and Diu','Delhi','Jammu and Kashmir',
  'Ladakh','Lakshadweep','Puducherry'
];

const COUNTRIES = [
  'India','United States','United Kingdom','Canada','Australia','Germany',
  'France','Japan','Singapore','UAE','Nepal','Sri Lanka','Bangladesh'
];

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const { loading } = useSelector(s => s.orders);
  const [step, setStep] = useState(1);
  const [animDir, setAnimDir] = useState('forward');
  const [pinLoading, setPinLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: user?.name || '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'India'
  });

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);
  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setAddress(def);
    }
  }, [user]);

  const subtotal = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 40;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  // Pincode lookup using free India Post API
  const lookupPincode = async (pin) => {
    if (pin.length !== 6) return;
    setPinLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setAddress(prev => ({ ...prev, city: po.District || po.Name, state: po.State, country: 'India' }));
        toast.success(`Found: ${po.District}, ${po.State}`);
      } else {
        toast.error('Pincode not found');
      }
    } catch {
      toast.error('Could not lookup pincode');
    }
    setPinLoading(false);
  };

  // Use current location (browser Geolocation + reverse geocode)
  const useCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`);
          const data = await res.json();
          const a = data?.address || {};
          setAddress(prev => ({
            ...prev,
            street: [a.road, a.neighbourhood, a.suburb].filter(Boolean).join(', ') || prev.street,
            city: a.city || a.town || a.village || a.county || prev.city,
            state: a.state || prev.state,
            zipCode: a.postcode || prev.zipCode,
            country: a.country || prev.country
          }));
          toast.success('Location detected!');
        } catch {
          toast.error('Failed to detect location');
        }
        setGeoLoading(false);
      },
      () => { toast.error('Location permission denied'); setGeoLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const goToStep = (n) => {
    setAnimDir(n > step ? 'forward' : 'backward');
    setStep(n);
  };

  const handlePayment = async () => {
    try {
      const { data: rpOrder } = await API.post('/payment/create-order', { amount: total });
      if (rpOrder.mockMode) {
        const orderData = {
          shippingAddress: address,
          paymentInfo: {
            razorpayOrderId: rpOrder.id,
            razorpayPaymentId: 'pay_mock_' + Date.now(),
            razorpaySignature: 'mock_signature',
            method: 'razorpay', status: 'paid'
          }
        };
        const result = await dispatch(createOrder(orderData)).unwrap();
        toast.success('Order placed successfully!');
        navigate(`/orders/${result._id}`);
        return;
      }
      const { data: keyData } = await API.get('/payment/key');
      const options = {
        key: keyData.key, amount: rpOrder.amount, currency: rpOrder.currency,
        name: 'Elixmart', description: 'Order Payment', order_id: rpOrder.id,
        handler: async (response) => {
          const { data: verification } = await API.post('/payment/verify', response);
          if (verification.verified) {
            const orderData = {
              shippingAddress: address,
              paymentInfo: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                method: 'razorpay', status: 'paid'
              }
            };
            const result = await dispatch(createOrder(orderData)).unwrap();
            toast.success('Payment successful! Order placed.');
            navigate(`/orders/${result._id}`);
          } else { toast.error('Payment verification failed'); }
        },
        prefill: { name: user?.name, email: user?.email, contact: address.phone },
        theme: { color: '#6366f1' }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) { toast.error(err.message || 'Payment failed'); }
  };

  if (items.length === 0) return <div className="container"><div className="empty-state"><h3>No items to checkout</h3></div></div>;

  return (
    <div className="container fade-in">
      <div className="page-header"><h1>Checkout</h1></div>

      {/* Progress Steps */}
      <div className="checkout-steps">
        {[{ n: 1, label: 'Address', icon: <FiMapPin /> }, { n: 2, label: 'Payment', icon: <FiCreditCard /> }, { n: 3, label: 'Confirm', icon: <FiCheck /> }].map((s, idx) => (
          <div key={s.n} className={`checkout-step ${step >= s.n ? 'active' : ''} ${step > s.n ? 'completed' : ''}`}
            onClick={() => s.n < step ? goToStep(s.n) : null} style={{ cursor: s.n < step ? 'pointer' : 'default' }}>
            <div className="step-circle">{step > s.n ? <FiCheck /> : s.icon}</div>
            <span className="step-label">{s.label}</span>
            {idx < 2 && <div className={`step-line ${step > s.n ? 'filled' : ''}`} />}
          </div>
        ))}
      </div>

      <div className="checkout-layout">
        <div>
          {/* Step 1: Address */}
          <div className={`checkout-panel ${step === 1 ? 'visible' : 'hidden'} ${animDir}`}>
            <div className="card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ margin: 0 }}>Shipping Address</h3>
                <button className="btn btn-secondary btn-sm" onClick={useCurrentLocation} disabled={geoLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                  {geoLoading ? <FiLoader className="spin-icon" /> : <FiNavigation />}
                  {geoLoading ? 'Detecting...' : 'Use My Location'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Full Name *</label>
                  <input className="form-input" value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} placeholder="John Doe" required /></div>
                <div className="form-group"><label>Phone *</label>
                  <input className="form-input" type="tel" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} placeholder="+91 9876543210" required /></div>
              </div>

              <div className="form-group"><label>Street Address *</label>
                <input className="form-input" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} placeholder="123 MG Road, Near City Mall" required /></div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>PIN Code * {pinLoading && <FiLoader className="spin-icon" style={{ marginLeft: 4 }} />}</label>
                  <input className="form-input" value={address.zipCode} maxLength={6}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setAddress({...address, zipCode: val});
                      if (val.length === 6) lookupPincode(val);
                    }} placeholder="400001" required />
                </div>
                <div className="form-group"><label>City *</label>
                  <input className="form-input" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} placeholder="Mumbai" required /></div>
                <div className="form-group"><label>State *</label>
                  <select className="form-input" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} required>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select></div>
              </div>

              <div className="form-group"><label>Country</label>
                <select className="form-input" value={address.country} onChange={e => setAddress({...address, country: e.target.value})}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select></div>

              <button className="btn btn-primary btn-lg mt-2" style={{ width: '100%' }} onClick={() => {
                if (!address.fullName || !address.phone || !address.street || !address.city || !address.state || !address.zipCode)
                  return toast.error('Please fill all required fields');
                goToStep(2);
              }}>Continue to Payment →</button>
            </div>
          </div>

          {/* Step 2: Payment */}
          <div className={`checkout-panel ${step === 2 ? 'visible' : 'hidden'} ${animDir}`}>
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ marginBottom: 20 }}>Payment</h3>
              <div style={{ padding: 20, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', marginBottom: 20, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <FiMapPin style={{ color: 'var(--primary)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Shipping to:</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {address.fullName}<br/>
                  {address.street}<br/>
                  {address.city}, {address.state} - {address.zipCode}<br/>
                  {address.country} | Phone: {address.phone}
                </p>
                <button className="btn btn-secondary btn-sm mt-1" onClick={() => goToStep(1)} style={{ fontSize: '0.78rem' }}>Change Address</button>
              </div>
              <div style={{ padding: 20, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', marginBottom: 24, border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiCreditCard style={{ color: 'var(--primary)' }} /> Razorpay (Test Mode)
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Secure payment via Razorpay. In test mode, orders are created directly.</p>
              </div>
              <button className="btn btn-primary btn-block btn-lg" onClick={handlePayment} disabled={loading}
                style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
                {loading ? 'Processing...' : <>💳 Pay ₹{total.toLocaleString()}</>}
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          {items.map(i => (
            <div key={i.product?._id} style={{ display: 'flex', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <img src={i.product?.images?.[0]?.url || ''} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.product?.name}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Qty: {i.quantity} × ₹{i.product?.price?.toLocaleString()}</p>
              </div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>₹{(i.product?.price * i.quantity).toLocaleString()}</p>
            </div>
          ))}
          <div className="row"><span>Subtotal ({items.length} items)</span><span>₹{subtotal.toLocaleString()}</span></div>
          <div className="row"><span>Shipping</span><span>{shipping === 0 ? <span className="text-accent">FREE</span> : `₹${shipping}`}</span></div>
          <div className="row"><span>Tax (18% GST)</span><span>₹{tax.toLocaleString()}</span></div>
          <div className="total"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
        </div>
      </div>
    </div>
  );
}
