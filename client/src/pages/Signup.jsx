import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signup, clearError } from '../store/slices/authSlice';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector(s => s.auth);

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    dispatch(signup({ name: form.name, email: form.email, password: form.password }));
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <h2>Create Account</h2>
        <p className="subtitle">Join Elixmart today</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiUser style={{ verticalAlign: 'middle' }} /> Full Name</label>
            <input className="form-input" type="text" placeholder="John Doe" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label><FiMail style={{ verticalAlign: 'middle' }} /> Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label><FiLock style={{ verticalAlign: 'middle' }} /> Password</label>
            <input className="form-input" type="password" placeholder="Min 6 characters" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <div className="form-group">
            <label><FiLock style={{ verticalAlign: 'middle' }} /> Confirm Password</label>
            <input className="form-input" type="password" placeholder="••••••••" required value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Creating...' : <><FiUserPlus /> Create Account</>}
          </button>
        </form>
        <p className="link-text mt-2">Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
}
