import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiStar } from 'react-icons/fi';
import { FaHeart, FaStar } from 'react-icons/fa';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { products: wishlistProducts } = useSelector(s => s.wishlist);
  const isWished = wishlistProducts?.some(p => p._id === product._id);
  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  const gotoLogin = () => {
    const redirect = encodeURIComponent(`/products/${product._id}`);
    navigate(`/login?redirect=${redirect}`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login first');
      gotoLogin();
      return;
    }
    dispatch(toggleWishlist(product._id));
  };

  const handleAddCart = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login first');
      gotoLogin();
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    toast.success('Added to cart!');
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card" style={{
      display: 'block', borderRadius: '20px', overflow: 'hidden',
      border: '1px solid rgba(71,85,105,0.4)',
      background: 'rgba(30,41,59,0.5)',
      transition: 'all 0.35s', textDecoration: 'none',
      position: 'relative',
    }}>
      {discount > 0 && (
        <span style={{
          position: 'absolute', top: '12px', left: '12px', zIndex: 5,
          padding: '4px 10px', borderRadius: '20px',
          background: '#ef4444', color: '#fff',
          fontSize: '0.72rem', fontWeight: 700,
        }}>{discount}% OFF</span>
      )}

      <button
        style={{
          position: 'absolute', top: '12px', right: '12px', zIndex: 5,
          width: '34px', height: '34px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isWished ? '#ef4444' : 'rgba(0,0,0,0.4)',
          border: isWished ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
          color: '#fff', cursor: 'pointer', backdropFilter: 'blur(4px)',
          transition: 'all 0.2s',
        }}
        onClick={handleWishlist}
      >
        {isWished ? <FaHeart size={13} /> : <FiHeart size={13} />}
      </button>

      <div style={{
        width: '100%', height: '220px',
        overflow: 'hidden', background: '#1e293b',
      }}>
        <img
          src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
          alt={product.name}
          loading="lazy"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            display: 'block', transition: 'transform 0.5s',
          }}
        />
      </div>

      <div style={{ padding: '16px 18px 20px' }}>
        {product.brand && (
          <div style={{
            fontSize: '0.7rem', fontWeight: 600, color: '#818cf8',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>{product.brand}</div>
        )}
        <h3 style={{
          fontSize: '0.92rem', fontWeight: 600, color: '#e2e8f0',
          margin: '6px 0', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>{product.name}</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', margin: '8px 0' }}>
          <div style={{ display: 'flex', gap: '1px', color: '#f59e0b', fontSize: '0.78rem' }}>
            {[...Array(5)].map((_, i) => (
              i < Math.round(product.ratings)
                ? <FaStar key={i} size={12} />
                : <FiStar key={i} size={12} />
            ))}
          </div>
          <span style={{ color: '#64748b', fontSize: '0.78rem', marginLeft: '4px' }}>({product.numReviews})</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9' }}>₹{product.price?.toLocaleString()}</span>
          {product.mrp > product.price && (
            <span style={{ fontSize: '0.82rem', color: '#64748b', textDecoration: 'line-through' }}>₹{product.mrp?.toLocaleString()}</span>
          )}
          {discount > 0 && (
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#10b981' }}>{discount}% off</span>
          )}
        </div>
      </div>
    </Link>
  );
}
