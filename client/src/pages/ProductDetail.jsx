import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist, fetchWishlist } from '../store/slices/wishlistSlice';
import { FaStar, FaHeart } from 'react-icons/fa';
import { FiStar, FiHeart, FiShoppingCart, FiCheck, FiMinus, FiPlus, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../utils/api';
import ProductCard from '../components/common/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector(s => s.products);
  const { user } = useSelector(s => s.auth);
  const { products: wishlistProducts } = useSelector(s => s.wishlist);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [activeTab, setActiveTab] = useState('description');
  const [addedToCart, setAddedToCart] = useState(false);

  const isWished = wishlistProducts?.some(p => p._id === id);

  useEffect(() => {
    dispatch(fetchProduct(id));
    if (user) dispatch(fetchWishlist());
    API.get(`/reviews/${id}`).then(r => setReviews(r.data)).catch(() => {});
    API.get(`/ai/recommendations/${id}`).then(r => setRecommendations(r.data)).catch(() => {});
  }, [dispatch, id, user]);

  const requireAuth = () => {
    if (!user) {
      toast.error('Please login first');
      navigate(`/login?redirect=${encodeURIComponent(`/products/${id}`)}`);
      return false;
    }
    return true;
  };

  const handleAddCart = () => {
    if (!requireAuth()) return;
    dispatch(addToCart({ productId: id, quantity: qty }));
    setAddedToCart(true);
    toast.success(`${qty} item${qty > 1 ? 's' : ''} added to cart!`);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = () => {
    if (!requireAuth()) return;
    dispatch(toggleWishlist(id));
    toast.success(isWished ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!requireAuth()) return;
    try {
      await API.post(`/reviews/${id}`, reviewForm);
      toast.success('Review submitted!');
      API.get(`/reviews/${id}`).then(r => setReviews(r.data));
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading || !product) return <div className="loader"><div className="spinner" /></div>;

  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <div className="container fade-in">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/products">Products</Link> / <span>{product.name}</span>
        </div>
      </div>

      <div className="product-detail">
        {/* Gallery */}
        <div className="product-gallery">
          <div className="main-image">
            <img src={product.images?.[0]?.url || 'https://via.placeholder.com/600'} alt={product.name} />
          </div>
          {product.images?.length > 1 && (
            <div className="thumbnails">{product.images.map((img, i) => (
              <div key={i} className="thumb"><img src={img.url} alt="" /></div>
            ))}</div>
          )}
        </div>

        {/* Info */}
        <div className="product-info">
          {product.brand && <div className="brand">{product.brand}</div>}
          <h1>{product.name}</h1>
          <div className="rating-bar">
            {[...Array(5)].map((_, i) => i < Math.round(product.ratings) ? <FaStar key={i} /> : <FiStar key={i} />)}
            <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>{product.ratings} ({product.numReviews} reviews)</span>
          </div>
          <div className="price-block">
            <span className="price">₹{product.price?.toLocaleString()}</span>
            {product.mrp > product.price && <span className="mrp">₹{product.mrp?.toLocaleString()}</span>}
            {discount > 0 && <span className="discount">{discount}% off</span>}
          </div>

          <p className="description">{product.description}</p>

          {product.features?.length > 0 && (
            <ul className="features">
              {product.features.map((f, i) => <li key={i}><FiCheck /> {f}</li>)}
            </ul>
          )}

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '20px 0', padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <FiTruck style={{ color: 'var(--accent)' }} /> <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Free delivery on orders above ₹500</span>
            <FiShield style={{ color: 'var(--primary)', marginLeft: 16 }} /> <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>1 Year Warranty</span>
          </div>

          <p style={{ fontWeight: 600, color: product.stock > 0 ? 'var(--accent)' : 'var(--danger)' }}>
            {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
          </p>

          {product.stock > 0 && (
            <>
              <div className="qty-selector">
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Quantity:</span>
                <button onClick={() => setQty(Math.max(1, qty - 1))}><FiMinus /></button>
                <span>{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))}><FiPlus /></button>
              </div>
              <div className="actions">
                <button className={`btn ${addedToCart ? 'btn-success cart-added' : 'btn-primary'} btn-lg`}
                  onClick={handleAddCart} disabled={addedToCart}>
                  {addedToCart ? <><FiCheck /> Added to Cart ✓</> : <><FiShoppingCart /> Add to Cart</>}
                </button>
                <button className={`btn ${isWished ? 'btn-danger' : 'btn-secondary'} btn-lg`} onClick={handleWishlist}>
                  {isWished ? <FaHeart /> : <FiHeart />} {isWished ? 'Wishlisted' : 'Wishlist'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border)', display: 'flex', gap: 0, marginTop: 40 }}>
        {['description', 'reviews'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '14px 24px', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textTransform: 'capitalize'
          }}>{tab} {tab === 'reviews' && `(${reviews.length})`}</button>
        ))}
      </div>

      <div style={{ padding: '24px 0 40px' }}>
        {activeTab === 'description' ? (
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 800 }}>
            <p>{product.description}</p>
            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                {product.tags.map((t, i) => <span key={i} style={{ padding: '4px 12px', background: 'var(--bg-elevated)', borderRadius: 20, fontSize: '0.8rem' }}>#{t}</span>)}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Review form */}
            {user && (
              <form onSubmit={handleReview} style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 24, maxWidth: 600 }}>
                <h4 style={{ marginBottom: 16 }}>Write a Review</h4>
                <div className="form-group">
                  <label>Rating</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5].map(r => (
                      <button key={r} type="button" onClick={() => setReviewForm({...reviewForm, rating: r})}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: r <= reviewForm.rating ? 'var(--secondary)' : 'var(--text-muted)', fontSize: '1.5rem' }}>
                        {r <= reviewForm.rating ? <FaStar /> : <FiStar />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <input className="form-input" placeholder="Review title" value={reviewForm.title} onChange={e => setReviewForm({...reviewForm, title: e.target.value})} />
                </div>
                <div className="form-group">
                  <textarea className="form-input" rows={3} placeholder="Your review..." value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary">Submit Review</button>
              </form>
            )}
            {/* Reviews list */}
            {reviews.length === 0 ? <p className="text-muted">No reviews yet.</p> : reviews.map(r => (
              <div key={r._id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', color: 'var(--secondary)' }}>{[...Array(5)].map((_, i) => i < r.rating ? <FaStar key={i} size={12} /> : <FiStar key={i} size={12} />)}</div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.user?.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                {r.title && <h5 style={{ marginBottom: 4 }}>{r.title}</h5>}
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section style={{ padding: '24px 0 48px' }}>
          <h2 style={{ marginBottom: 20 }}>🤖 You May Also Like</h2>
          <div className="products-grid">{recommendations.map(p => <ProductCard key={p._id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}
