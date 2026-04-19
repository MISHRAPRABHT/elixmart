import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import { fetchWishlist } from '../store/slices/wishlistSlice';
import ProductCard from '../components/common/ProductCard';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones, FiStar, FiZap, FiGift, FiPercent } from 'react-icons/fi';

const showcaseProducts = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    price: 2499,
    mrp: 4999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80&fm=webp',
    category: 'Electronics',
  },
  {
    id: 2,
    name: 'Minimalist Analog Watch',
    price: 3299,
    mrp: 5999,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80&fm=webp',
    category: 'Accessories',
  },
  {
    id: 3,
    name: 'Classic Leather Sneakers',
    price: 1899,
    mrp: 3499,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&fm=webp',
    category: 'Footwear',
  },
  {
    id: 4,
    name: 'Designer Sunglasses',
    price: 1499,
    mrp: 2999,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80&fm=webp',
    category: 'Accessories',
  },
  {
    id: 5,
    name: 'Smart Fitness Band',
    price: 1999,
    mrp: 3499,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&q=80&fm=webp',
    category: 'Electronics',
  },
  {
    id: 6,
    name: 'Portable Bluetooth Speaker',
    price: 3999,
    mrp: 6999,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80&fm=webp',
    category: 'Electronics',
  },
];

const trustFeatures = [
  { icon: <FiTruck />, title: 'Free Shipping', desc: 'On orders over ₹500', color: 'from-violet-500 to-indigo-500' },
  { icon: <FiShield />, title: 'Secure Payment', desc: '100% protected', color: 'from-emerald-500 to-teal-500' },
  { icon: <FiRefreshCw />, title: 'Easy Returns', desc: '30-day return policy', color: 'from-amber-500 to-orange-500' },
  { icon: <FiHeadphones />, title: '24/7 Support', desc: 'Dedicated support', color: 'from-pink-500 to-rose-500' },
];

// Live countdown: time remaining until midnight
function useCountdown() {
  const getTimeLeft = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const diff = Math.max(0, end - now);
    return {
      hours: String(Math.floor(diff / 3600000)).padStart(2, '0'),
      mins: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
      secs: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
    };
  };
  const [time, setTime] = useState(getTimeLeft);
  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Home() {
  const dispatch = useDispatch();
  const { products, categories, loading } = useSelector(s => s.products);
  const { user } = useSelector(s => s.auth);
  const [email, setEmail] = useState('');
  const countdown = useCountdown();

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8, featured: 'true' }));
    dispatch(fetchCategories());
    if (user) dispatch(fetchWishlist());
  }, [dispatch, user]);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>

      {/* ===== HERO SECTION ===== */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '100px 24px 120px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e1b4b 100%)',
      }}>
        {/* Background glows */}
        <div style={{
          position: 'absolute', top: '-120px', left: '-80px',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-60px',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '55%',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(50px)',
        }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto' }}>
          {/* Pill badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', marginBottom: '28px',
            borderRadius: '50px', border: '1px solid rgba(99,102,241,0.3)',
            background: 'rgba(99,102,241,0.1)', backdropFilter: 'blur(8px)',
            color: '#a5b4fc', fontSize: '13px', fontWeight: 500,
          }}>
            <FiZap style={{ color: '#fbbf24' }} />
            <span>New Season Collection is Live</span>
            <FiArrowRight size={14} />
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            fontWeight: 800, lineHeight: 1.15,
            color: '#fff', margin: '0 0 8px',
          }}>
            Discover{' '}
            <span style={{
              background: 'linear-gradient(to right, #818cf8, #a78bfa, #f472b6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Premium Products</span>
          </h1>
          <p style={{
            fontSize: 'clamp(1.2rem, 3vw, 2rem)',
            fontWeight: 600, color: '#cbd5e1', margin: '0 0 24px',
          }}>
            at Unbeatable Prices
          </p>

          <p style={{
            fontSize: '1.05rem', color: '#94a3b8',
            maxWidth: '550px', margin: '0 auto 40px', lineHeight: 1.7,
          }}>
            Shop curated collections from top brands. Free shipping on orders over ₹500.
            Join <span style={{ color: '#818cf8', fontWeight: 600 }}>50,000+</span> happy customers.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginBottom: '60px' }}>
            <Link to="/products" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '16px 36px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
              color: '#fff', fontWeight: 700, fontSize: '1.05rem',
              boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
              transition: 'all 0.3s', textDecoration: 'none',
            }}>
              Shop Now <FiArrowRight />
            </Link>
            <Link to="/products?sort=newest" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '16px 36px', borderRadius: '16px',
              border: '1px solid #475569', color: '#cbd5e1',
              fontWeight: 600, fontSize: '1.05rem',
              transition: 'all 0.3s', textDecoration: 'none',
              background: 'transparent',
            }}>
              New Arrivals
            </Link>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '48px',
            flexWrap: 'wrap',
          }}>
            {[
              { val: '50K+', label: 'Happy Customers' },
              { val: '10K+', label: 'Products' },
              { val: '99%', label: 'Satisfaction' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.8rem', fontWeight: 800,
                  background: 'linear-gradient(to right, #818cf8, #a78bfa)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>{s.val}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section style={{ padding: '0 24px', marginTop: '-40px', position: 'relative', zIndex: 20 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px', maxWidth: '1200px', margin: '0 auto',
        }}>
          {trustFeatures.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '14px',
              padding: '20px 24px', borderRadius: '16px',
              background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(71,85,105,0.4)',
              transition: 'all 0.3s',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                background: i === 0 ? 'linear-gradient(135deg, #7c3aed, #6366f1)' :
                           i === 1 ? 'linear-gradient(135deg, #10b981, #14b8a6)' :
                           i === 2 ? 'linear-gradient(135deg, #f59e0b, #f97316)' :
                                     'linear-gradient(135deg, #ec4899, #f43f5e)',
                color: '#fff', fontSize: '1.2rem',
              }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>{f.title}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      {categories.length > 0 && (
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Shop by Category</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>Browse our curated collections</p>
            </div>
            <Link to="/products" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: '#818cf8', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
            }}>
              View All <FiArrowRight />
            </Link>
          </div>
          <div style={{
            display: 'flex', gap: '24px', overflowX: 'auto',
            paddingBottom: '16px', scrollSnapType: 'x mandatory',
          }}>
            {categories.map(cat => (
              <Link to={`/products?category=${cat._id}`} key={cat._id} style={{
                flexShrink: 0, width: '140px', textAlign: 'center',
                scrollSnapAlign: 'start', textDecoration: 'none',
              }}>
                <div style={{
                  width: '110px', height: '110px', borderRadius: '50%',
                  overflow: 'hidden', margin: '0 auto',
                  border: '3px solid #334155',
                  transition: 'all 0.3s',
                }}>
                  <img src={cat.image || 'https://via.placeholder.com/100'} alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <span style={{
                  display: 'block', marginTop: '12px',
                  fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1',
                }}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== SHOWCASE PRODUCTS (Free WebP images) ===== */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 24px' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '50px',
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
            color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700,
            marginBottom: '16px',
          }}>
            <FiStar /> TRENDING NOW
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px' }}>
            Today's Best Picks
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto', fontSize: '0.95rem' }}>
            Hand-picked products curated just for you. Limited-time offers you don't want to miss.
          </p>
        </div>

        {/* Product grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {showcaseProducts.map(item => {
            const discount = Math.round(((item.mrp - item.price) / item.mrp) * 100);
            return (
              <Link to="/products" key={item.id} style={{
                display: 'block', borderRadius: '20px', overflow: 'hidden',
                border: '1px solid rgba(71,85,105,0.4)',
                background: 'rgba(30,41,59,0.5)',
                transition: 'all 0.35s', textDecoration: 'none',
                position: 'relative',
              }}>
                {/* badges */}
                <span style={{
                  position: 'absolute', top: '14px', left: '14px', zIndex: 5,
                  padding: '5px 12px', borderRadius: '50px',
                  background: '#ef4444', color: '#fff',
                  fontSize: '0.72rem', fontWeight: 700,
                }}>{discount}% OFF</span>
                <span style={{
                  position: 'absolute', top: '14px', right: '14px', zIndex: 5,
                  padding: '5px 12px', borderRadius: '50px',
                  background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)',
                  color: '#cbd5e1', fontSize: '0.72rem', fontWeight: 500,
                  border: '1px solid rgba(71,85,105,0.4)',
                }}>{item.category}</span>

                {/* image */}
                <div style={{
                  width: '100%', height: '240px',
                  overflow: 'hidden', background: '#1e293b',
                  position: 'relative',
                }}>
                  <img src={item.image} alt={item.name} loading="lazy" style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    display: 'block', transition: 'transform 0.5s',
                  }} />
                  {/* bottom gradient overlay */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
                    background: 'linear-gradient(to top, rgba(15,23,42,0.6), transparent)',
                  }} />
                </div>

                {/* card body */}
                <div style={{ padding: '20px 24px 24px' }}>
                  <h3 style={{
                    fontSize: '1rem', fontWeight: 700, color: '#f1f5f9',
                    margin: '0 0 10px',
                  }}>{item.name}</h3>

                  {/* rating stars */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '12px' }}>
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} size={13}
                        style={{ color: '#fbbf24', fill: i < 4 ? '#fbbf24' : 'none' }} />
                    ))}
                    <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: '6px' }}>(128)</span>
                  </div>

                  {/* price */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f1f5f9' }}>
                      ₹{item.price.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', textDecoration: 'line-through' }}>
                      ₹{item.mrp.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981' }}>
                      {discount}% off
                    </span>
                  </div>

                  {/* CTA */}
                  <div style={{
                    width: '100%', padding: '12px 0',
                    borderRadius: '12px', textAlign: 'center',
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    color: '#a5b4fc', fontWeight: 600, fontSize: '0.88rem',
                    transition: 'all 0.3s',
                  }}>
                    View Product →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS (from API) ===== */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>✨ Featured Products</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>Our best-selling items this season</p>
          </div>
          <Link to="/products?featured=true" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: '#818cf8', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
          }}>
            View All <FiArrowRight />
          </Link>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px',
          }}>
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* ===== DEALS BANNER ===== */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: '24px',
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
          {/* Background */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #1e1b4b, #312e81, #1e1b4b)',
          }} />
          <div style={{
            position: 'absolute', top: '-50px', left: '20%',
            width: '250px', height: '250px',
            background: 'rgba(99,102,241,0.15)', borderRadius: '50%', filter: 'blur(60px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-40px', right: '20%',
            width: '200px', height: '200px',
            background: 'rgba(139,92,246,0.12)', borderRadius: '50%', filter: 'blur(50px)',
          }} />

          <div style={{
            position: 'relative', zIndex: 5,
            display: 'flex', flexWrap: 'wrap', alignItems: 'center',
            justifyContent: 'space-between', gap: '32px',
            padding: '48px 40px',
          }}>
            <div style={{ flex: '1 1 400px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '50px',
                background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                color: '#fbbf24', fontSize: '0.72rem', fontWeight: 700,
                marginBottom: '20px',
              }}>
                <FiPercent /> LIMITED TIME OFFER
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
                🔥 Super Deal of the Day
              </h2>
              <p style={{ color: '#cbd5e1', maxWidth: '480px', margin: '0 0 28px', fontSize: '1.05rem', lineHeight: 1.7 }}>
                Get up to <span style={{ color: '#fbbf24', fontWeight: 700 }}>60% off</span> on electronics.
                Don't miss out on these incredible deals!
              </p>

              {/* Live Countdown Timer */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { val: countdown.hours, label: 'Hours' },
                  { val: countdown.mins, label: 'Mins' },
                  { val: countdown.secs, label: 'Secs' },
                ].map((t, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '14px 20px', borderRadius: '14px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    minWidth: '68px',
                    transition: 'all 0.3s',
                  }}>
                    <span style={{
                      fontSize: '1.8rem', fontWeight: 800, color: '#fff',
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1,
                    }}>{t.val}</span>
                    <span style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/products?category=electronics&sort=price_asc" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '16px 36px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              color: '#fff', fontWeight: 700, fontSize: '1.05rem',
              boxShadow: '0 8px 32px rgba(245,158,11,0.25)',
              textDecoration: 'none', whiteSpace: 'nowrap',
              transition: 'all 0.3s',
            }}>
              Shop Now <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== WHY ELIXMART ===== */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px' }}>Why Choose Elixmart?</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>We're committed to providing the best shopping experience</p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {[
            {
              icon: <FiGift size={24} />,
              title: 'Curated Selection',
              desc: 'Every product is hand-picked by our team to ensure quality and value for our customers.',
              gradient: 'linear-gradient(135deg, #6366f1, #7c3aed)',
            },
            {
              icon: <FiZap size={24} />,
              title: 'Lightning Fast Delivery',
              desc: 'Get your orders delivered within 24-48 hours with our express shipping partners.',
              gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
            },
            {
              icon: <FiShield size={24} />,
              title: 'Buyer Protection',
              desc: 'Shop with confidence knowing every purchase is backed by our 100% guarantee.',
              gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
            },
          ].map((item, i) => (
            <div key={i} style={{
              borderRadius: '20px', padding: '36px 32px', textAlign: 'center',
              background: 'rgba(30,41,59,0.4)',
              border: '1px solid rgba(71,85,105,0.4)',
              transition: 'all 0.3s',
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '56px', height: '56px', borderRadius: '16px',
                background: item.gradient, color: '#fff',
                marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 10px' }}>{item.title}</h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          borderRadius: '24px', padding: '60px 40px', textAlign: 'center',
          background: 'rgba(30,41,59,0.4)',
          border: '1px solid rgba(71,85,105,0.4)',
        }}>
          {/* Decorative blurs */}
          <div style={{
            position: 'absolute', top: '-100px', left: '30%',
            width: '300px', height: '300px',
            background: 'rgba(99,102,241,0.06)', borderRadius: '50%', filter: 'blur(80px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-80px', right: '25%',
            width: '250px', height: '250px',
            background: 'rgba(139,92,246,0.05)', borderRadius: '50%', filter: 'blur(60px)',
          }} />

          <div style={{ position: 'relative', zIndex: 5 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 12px' }}>Stay in the Loop</h2>
            <p style={{ color: '#94a3b8', maxWidth: '440px', margin: '0 auto 32px', fontSize: '0.95rem', lineHeight: 1.7 }}>
              Subscribe to get exclusive deals, new arrivals, and insider-only discounts delivered to your inbox.
            </p>

            <form
              style={{
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                gap: '12px', maxWidth: '460px', margin: '0 auto',
              }}
              onSubmit={e => { e.preventDefault(); setEmail(''); }}
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={{
                  flex: '1 1 250px', padding: '14px 20px',
                  borderRadius: '14px', background: 'rgba(15,23,42,0.7)',
                  border: '1px solid #475569', color: '#f1f5f9',
                  fontSize: '0.95rem', outline: 'none',
                  transition: 'border-color 0.3s',
                }}
              />
              <button type="submit" style={{
                padding: '14px 28px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(99,102,241,0.25)',
                transition: 'all 0.3s',
              }}>
                Subscribe
              </button>
            </form>

            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '16px' }}>No spam, ever. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
