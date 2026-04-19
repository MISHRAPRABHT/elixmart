import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, toggleWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { FaStar } from 'react-icons/fa';
import { FiStar, FiTrash2, FiShoppingCart, FiHeart, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector(s => s.wishlist);

  useEffect(() => { dispatch(fetchWishlist()); }, [dispatch]);

  const handleMoveToCart = (productId) => {
    dispatch(addToCart({ productId, quantity: 1 }));
    dispatch(toggleWishlist(productId));
    toast.success('Moved to cart!');
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div className="container fade-in">
      <div className="page-header"><h1><FiHeart style={{ verticalAlign: 'middle' }} /> My Wishlist ({products.length})</h1></div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="icon">💝</div>
          <h3>Your wishlist is empty</h3>
          <p className="text-muted mb-2">Save your favorite products here</p>
          <Link to="/products" className="btn btn-primary">Browse Products <FiArrowRight /></Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {products.map(p => (
            <div key={p._id} className="product-card">
              <Link to={`/products/${p._id}`}>
                <div className="product-card-image">
                  <img src={p.images?.[0]?.url || 'https://via.placeholder.com/300'} alt={p.name} />
                </div>
                <div className="product-card-body">
                  <h3 className="product-card-title">{p.name}</h3>
                  <div className="product-card-rating">
                    <div className="stars">{[...Array(5)].map((_, i) => i < Math.round(p.ratings) ? <FaStar key={i} /> : <FiStar key={i} />)}</div>
                  </div>
                  <div className="product-card-price">
                    <span className="price">₹{p.price?.toLocaleString()}</span>
                    {p.mrp > p.price && <span className="mrp">₹{p.mrp?.toLocaleString()}</span>}
                  </div>
                </div>
              </Link>
              <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleMoveToCart(p._id)}><FiShoppingCart /> Move to Cart</button>
                <button className="btn btn-secondary btn-sm" onClick={() => dispatch(toggleWishlist(p._id))}><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
