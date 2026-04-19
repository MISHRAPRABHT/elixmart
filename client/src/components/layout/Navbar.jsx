import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiShoppingCart, FiHeart, FiUser, FiLogOut, FiPackage, FiSettings, FiChevronDown } from 'react-icons/fi';
import { logoutServer } from '../../store/slices/authSlice';
import SmartSearch from '../common/SmartSearch';

export default function Navbar() {
  const { user } = useSelector(s => s.auth);
  const { items } = useSelector(s => s.cart);
  const [showMenu, setShowMenu] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutServer());
    setShowMenu(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">🛍️ Elixmart</Link>

        <SmartSearch />

        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/wishlist" title="Wishlist"><FiHeart size={20} /></Link>
              <Link to="/cart" title="Cart" style={{ position: 'relative' }}>
                <FiShoppingCart size={20} />
                {items.length > 0 && <span className="nav-badge">{items.length}</span>}
              </Link>
              <div className="nav-user-menu">
                <button onClick={() => setShowMenu(!showMenu)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiUser size={18} /> {user.name?.split(' ')[0]} <FiChevronDown size={14} />
                </button>
                {showMenu && (
                  <div className="nav-dropdown" onMouseLeave={() => setShowMenu(false)}>
                    <Link to="/profile" onClick={() => setShowMenu(false)}><FiUser /> My Profile</Link>
                    <Link to="/profile" onClick={() => setShowMenu(false)}><FiPackage /> My Orders</Link>
                    {user.role === 'admin' && <Link to="/admin" onClick={() => setShowMenu(false)}><FiSettings /> Admin Panel</Link>}
                    <button onClick={handleLogout}><FiLogOut /> Sign Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" style={{ gap: 6 }}>
              <FiUser size={16} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
