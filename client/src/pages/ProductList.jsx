import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import { fetchWishlist } from '../store/slices/wishlistSlice';
import ProductCard from '../components/common/ProductCard';
import { FiFilter, FiX } from 'react-icons/fi';

export default function ProductList() {
  const dispatch = useDispatch();
  const { products, categories, loading, page, pages, total } = useSelector(s => s.products);
  const { user } = useSelector(s => s.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = Number(searchParams.get('page') || 1);
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentRating = searchParams.get('rating') || '';

  useEffect(() => {
    const params = { page: currentPage, sort: currentSort };
    if (currentCategory) params.category = currentCategory;
    if (currentSearch) params.search = currentSearch;
    if (currentMinPrice) params.minPrice = currentMinPrice;
    if (currentMaxPrice) params.maxPrice = currentMaxPrice;
    if (currentRating) params.rating = currentRating;
    if (searchParams.get('featured')) params.featured = 'true';
    dispatch(fetchProducts(params));
    dispatch(fetchCategories());
    if (user) dispatch(fetchWishlist());
  }, [dispatch, currentCategory, currentSearch, currentSort, currentPage, currentMinPrice, currentMaxPrice, currentRating, searchParams, user]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <div className="container fade-in">
      <div className="page-header">
        <h1>{currentSearch ? `Results for "${currentSearch}"` : 'All Products'}</h1>
        <p className="text-muted" style={{ marginTop: 4 }}>{total} products found</p>
      </div>

      {/* Sort & filter bar */}
      <div className="flex-between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters(!showFilters)}>
          <FiFilter /> Filters
        </button>
        <div className="flex gap-1" style={{ alignItems: 'center' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>Sort by:</span>
          <select className="form-input" style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
            value={currentSort} onChange={e => updateFilter('sort', e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Best Rating</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showFilters ? '260px 1fr' : '1fr', gap: 24 }}>
        {/* Filters */}
        {showFilters && (
          <div className="filters-sidebar fade-in">
            <div className="flex-between">
              <h3 style={{ margin: 0 }}>Filters</h3>
              <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem' }}>Clear All</button>
            </div>
            <div className="filter-group">
              <h4>Category</h4>
              {categories.map(cat => (
                <label key={cat._id} className="filter-option">
                  <input type="radio" name="category" checked={currentCategory === cat._id} onChange={() => updateFilter('category', cat._id)} />
                  {cat.name}
                </label>
              ))}
              {currentCategory && <button onClick={() => updateFilter('category', '')} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem', marginTop: 4 }}><FiX /> Clear</button>}
            </div>
            <div className="filter-group">
              <h4>Price Range</h4>
              <div className="flex gap-1">
                <input type="number" className="form-input" placeholder="Min" value={currentMinPrice} onChange={e => updateFilter('minPrice', e.target.value)} style={{ fontSize: '0.85rem' }} />
                <input type="number" className="form-input" placeholder="Max" value={currentMaxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} style={{ fontSize: '0.85rem' }} />
              </div>
            </div>
            <div className="filter-group">
              <h4>Rating</h4>
              {[4, 3, 2, 1].map(r => (
                <label key={r} className="filter-option">
                  <input type="radio" name="rating" checked={currentRating === String(r)} onChange={() => updateFilter('rating', r)} />
                  {r}★ & above
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div>
          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <div className="products-grid">{products.map(p => <ProductCard key={p._id} product={p} />)}</div>
              {pages > 1 && (
                <div className="pagination">
                  <button disabled={page <= 1} onClick={() => updateFilter('page', page - 1)}>‹</button>
                  {[...Array(pages)].map((_, i) => (
                    <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => updateFilter('page', i + 1)}>{i + 1}</button>
                  ))}
                  <button disabled={page >= pages} onClick={() => updateFilter('page', page + 1)}>›</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
