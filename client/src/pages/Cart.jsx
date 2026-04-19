import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart } from '../store/slices/cartSlice';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector(s => s.cart);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const subtotal = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 40;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div className="container fade-in">
      <div className="page-header"><h1><FiShoppingBag style={{ verticalAlign: 'middle' }} /> Shopping Cart ({items.length})</h1></div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p className="text-muted mb-2">Looks like you haven't added anything yet</p>
          <Link to="/products" className="btn btn-primary">Start Shopping <FiArrowRight /></Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            {items.map(item => (
              <div key={item.product?._id} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/120'} alt={item.product?.name} />
                </div>
                <div className="cart-item-info">
                  <Link to={`/products/${item.product?._id}`}><h4>{item.product?.name}</h4></Link>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Unit: ₹{item.product?.price?.toLocaleString()}</p>
                  <div className="cart-item-actions">
                    <div className="qty-selector" style={{ margin: 0 }}>
                      <button onClick={() => dispatch(updateCartItem({ productId: item.product?._id, quantity: item.quantity - 1 }))}><FiMinus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => dispatch(updateCartItem({ productId: item.product?._id, quantity: item.quantity + 1 }))}><FiPlus size={14} /></button>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => dispatch(removeFromCart(item.product?._id))} style={{ color: 'var(--danger)' }}>
                      <FiTrash2 /> Remove
                    </button>
                  </div>
                  <p className="price">₹{(item.product?.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="row"><span>Subtotal ({items.length} items)</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="row"><span>Shipping</span><span>{shipping === 0 ? <span className="text-accent">FREE</span> : `₹${shipping}`}</span></div>
            <div className="row"><span>Tax (18% GST)</span><span>₹{tax.toLocaleString()}</span></div>
            <div className="total"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
            <button className="btn btn-primary btn-block btn-lg mt-2" onClick={() => navigate('/checkout')}>Proceed to Checkout <FiArrowRight /></button>
            {subtotal < 500 && <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: 12, textAlign: 'center' }}>Add ₹{500 - subtotal} more for free shipping!</p>}
          </div>
        </div>
      )}
    </div>
  );
}
