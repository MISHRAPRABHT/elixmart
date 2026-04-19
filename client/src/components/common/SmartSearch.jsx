import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiSearch, FiTrendingUp, FiClock, FiMic, FiX, FiArrowRight, FiStar } from 'react-icons/fi';
import API from '../../utils/api';

const STORAGE_KEY = 'elixmart_recent_searches';

export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [listening, setListening] = useState(false);
  const ref = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setRecentSearches(saved.slice(0, 5));
    } catch { }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.length < 2) {
      // Fetch trending when empty
      if (open) {
        API.get('/ai/search-suggestions?q=').then(r => setResults(r.data)).catch(() => { });
      }
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await API.get(`/ai/search-suggestions?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch { }
      setLoading(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, open]);

  const saveSearch = (term) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveSearch(query.trim());
    setOpen(false);
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  const handleSuggestionClick = (term) => {
    saveSearch(term);
    setQuery(term);
    setOpen(false);
    navigate(`/products?search=${encodeURIComponent(term)}`);
  };

  const handleProductClick = (id) => {
    setOpen(false);
    navigate(`/products/${id}`);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Voice Search
  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setQuery(text);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const showDropdown = open && results;
  const hasQuery = query.trim().length >= 2;

  return (
    <div className="smart-search" ref={ref}>
      <form onSubmit={handleSubmit} className="smart-search-form">
        <FiSearch className="smart-search-icon" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); if (!open) setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search products, brands, categories..."
          className="smart-search-input"
          autoComplete="off"
        />
        {query && (
          <button type="button" className="smart-search-clear" onClick={() => { setQuery(''); setResults(null); }}>
            <FiX size={16} />
          </button>
        )}
        <button type="button" className={`smart-search-voice ${listening ? 'active' : ''}`} onClick={startVoice} title="Voice search">
          <FiMic size={16} />
        </button>
        <button type="submit" className="smart-search-btn">
          Search
        </button>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="smart-search-dropdown">
          {loading && <div className="ssd-loading"><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /></div>}

          {/* When no query — show recent + trending + popular */}
          {!hasQuery && (
            <>
              {recentSearches.length > 0 && (
                <div className="ssd-section">
                  <div className="ssd-header">
                    <span><FiClock size={14} /> Recent Searches</span>
                    <button onClick={clearRecent}>Clear</button>
                  </div>
                  {recentSearches.map((s, i) => (
                    <button key={i} className="ssd-item" onClick={() => handleSuggestionClick(s)}>
                      <FiClock size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>{s}</span>
                      <FiArrowRight size={12} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                    </button>
                  ))}
                </div>
              )}
              {results?.popularSearches?.length > 0 && (
                <div className="ssd-section">
                  <div className="ssd-header"><span><FiTrendingUp size={14} /> Trending Searches</span></div>
                  <div className="ssd-tags">
                    {results.popularSearches.map((s, i) => (
                      <button key={i} className="ssd-tag" onClick={() => handleSuggestionClick(s)}>
                        <FiTrendingUp size={11} /> {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {results?.trending?.length > 0 && (
                <div className="ssd-section">
                  <div className="ssd-header"><span>🔥 Trending Products</span></div>
                  <div className="ssd-products-row">
                    {results.trending.map(p => (
                      <button key={p._id} className="ssd-product-mini" onClick={() => handleProductClick(p._id)}>
                        <img src={p.image || ''} alt="" />
                        <span>{p.name?.substring(0, 20)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* When has query — show results */}
          {hasQuery && !loading && (
            <>
              {/* Did you mean */}
              {results?.didYouMean && results.products?.length === 0 && (
                <div className="ssd-section">
                  <p style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Did you mean: <button onClick={() => handleSuggestionClick(results.didYouMean)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                      {results.didYouMean}
                    </button>?
                  </p>
                </div>
              )}

              {/* Matching categories */}
              {results?.categories?.length > 0 && (
                <div className="ssd-section">
                  <div className="ssd-header"><span>📁 Categories</span></div>
                  {results.categories.map(c => (
                    <Link key={c._id} className="ssd-item" to={`/products?category=${c._id}`} onClick={() => setOpen(false)}>
                      <span>{c.name}</span>
                      <FiArrowRight size={12} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                    </Link>
                  ))}
                </div>
              )}

              {/* Matching brands */}
              {results?.brands?.length > 0 && (
                <div className="ssd-section">
                  <div className="ssd-header"><span>🏷️ Brands</span></div>
                  <div className="ssd-tags">
                    {results.brands.map((b, i) => (
                      <button key={i} className="ssd-tag" onClick={() => handleSuggestionClick(b)}>{b}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching products */}
              {results?.products?.length > 0 && (
                <div className="ssd-section">
                  <div className="ssd-header">
                    <span>🛍️ Products</span>
                    <button onClick={handleSubmit}>View all results</button>
                  </div>
                  {results.products.map(p => (
                    <button key={p._id} className="ssd-product" onClick={() => handleProductClick(p._id)}>
                      <img src={p.image || ''} alt="" className="ssd-product-img" />
                      <div className="ssd-product-info">
                        <span className="ssd-product-name">{p.name}</span>
                        <span className="ssd-product-meta">
                          {p.brand} • <FiStar size={11} style={{ color: 'var(--secondary)' }} /> {p.ratings}
                        </span>
                      </div>
                      <div className="ssd-product-price">
                        <span>₹{p.price?.toLocaleString()}</span>
                        {p.mrp > p.price && <span className="ssd-mrp">₹{p.mrp?.toLocaleString()}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {results?.products?.length === 0 && !results?.didYouMean && (
                <div className="ssd-section" style={{ textAlign: 'center', padding: '24px 16px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No results for "{query}"</p>
                  <button className="btn btn-secondary btn-sm mt-1" onClick={handleSubmit}>
                    Search all products
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
