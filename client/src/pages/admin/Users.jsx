import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { FiTrash2 } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    API.get('/admin/users').then(r => { setUsers(r.data.users); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateRole = async (id, role) => {
    try { await API.put(`/admin/users/${id}`, { role }); toast.success('Role updated'); load(); }
    catch (err) { toast.error('Failed'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await API.delete(`/admin/users/${id}`); toast.success('User deleted'); load(); }
    catch (err) { toast.error('Failed'); }
  };

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 24 }}>Users ({users.length})</h1>

      {loading ? <div className="loader"><div className="spinner" /></div> : (
        <div className="card">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <select className="form-input" style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                      value={u.role} onChange={e => updateRole(u._id, e.target.value)}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}><FiTrash2 /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
