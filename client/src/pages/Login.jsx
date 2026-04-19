import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, error } = useSelector(s => s.auth);

  const redirectTo = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user, navigate, redirectTo]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const handleSubmit = (e) => { e.preventDefault(); dispatch(login(form)); };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiMail style={{ verticalAlign: 'middle' }} /> Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label><FiLock style={{ verticalAlign: 'middle' }} /> Password</label>
            <input className="form-input" type="password" placeholder="••••••••" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : <><FiLogIn /> Sign In</>}
          </button>
        </form>
        <div className="divider">or</div>
        <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Demo accounts:</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Admin: admin@shopverse.com / admin123</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>User: john@example.com / user123</p>
        </div>
        <p className="link-text">Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </div>
    </div>
  );
}
