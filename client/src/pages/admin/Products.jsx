import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', mrp: '', category: '', brand: '', stock: '', tags: '', features: '', isFeatured: false });

  const load = () => {
    setLoading(true);
    Promise.all([API.get('/products?limit=100'), API.get('/categories')])
      .then(([p, c]) => { setProducts(p.data.products); setCategories(c.data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '', mrp: '', category: categories[0]?._id || '', brand: '', stock: '', tags: '', features: '', isFeatured: false });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p._id);
    setForm({ name: p.name, description: p.description, price: p.price, mrp: p.mrp || '', category: p.category?._id || p.category, brand: p.brand, stock: p.stock, tags: p.tags?.join(', ') || '', features: p.features?.join(', ') || '', isFeatured: p.isFeatured });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, price: Number(form.price), mrp: Number(form.mrp) || Number(form.price), stock: Number(form.stock),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), features: form.features.split(',').map(f => f.trim()).filter(Boolean),
      images: [{ url: 'https://via.placeholder.com/600', public_id: 'placeholder' }] };
    try {
      if (editing) { await API.put(`/products/${editing}`, data); toast.success('Product updated'); }
      else { await API.post('/products', data); toast.success('Product created'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await API.delete(`/products/${id}`); toast.success('Deleted'); load(); }
    catch (err) { toast.error('Failed'); }
  };

  return (
    <AdminLayout>
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <h1>Products ({products.length})</h1>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Product</button>
      </div>

      {loading ? <div className="loader"><div className="spinner" /></div> : (
        <div className="card">
          <table className="data-table">
            <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td><img src={p.images?.[0]?.url || ''} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} alt="" /></td>
                  <td style={{ fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</td>
                  <td><span className="badge badge-placed">{p.category?.name || 'N/A'}</span></td>
                  <td style={{ fontWeight: 600 }}>₹{p.price?.toLocaleString()}</td>
                  <td><span style={{ color: p.stock > 0 ? 'var(--accent)' : 'var(--danger)' }}>{p.stock}</span></td>
                  <td>{p.isFeatured ? '⭐' : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}><FiEdit2 /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="flex-between mb-2">
              <h3>{editing ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Name</label><input className="form-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="form-group"><label>Description</label><textarea className="form-input" rows={3} required value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group"><label>Price (₹)</label><input className="form-input" type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
                <div className="form-group"><label>MRP (₹)</label><input className="form-input" type="number" value={form.mrp} onChange={e => setForm({...form, mrp: e.target.value})} /></div>
                <div className="form-group"><label>Stock</label><input className="form-input" type="number" required value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label>Category</label><select className="form-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>{categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                <div className="form-group"><label>Brand</label><input className="form-input" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Tags (comma-separated)</label><input className="form-input" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} /></div>
              <div className="form-group"><label>Features (comma-separated)</label><input className="form-input" value={form.features} onChange={e => setForm({...form, features: e.target.value})} /></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 16 }}>
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} style={{ accentColor: 'var(--primary)' }} /> Featured Product
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
