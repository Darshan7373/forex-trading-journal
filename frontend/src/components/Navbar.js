import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine active link
  const isTradesActive = location.pathname.includes('/trades');
  const isAnalyticsActive = location.pathname.includes('/analytics');

  return (
    <nav className="navbar">
      {/* Left Section: Branding & Navigation */}
      <div className="navbar-left">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">📊</span>
          <span>Forex Journal</span>
        </Link>

        {/* Navigation Links */}
        <div className="navbar-nav">
          <Link
            to="/trades"
            className={`nav-link ${isTradesActive ? 'active' : ''}`}
          >
            Trades
          </Link>
          <Link
            to="/analytics"
            className={`nav-link ${isAnalyticsActive ? 'active' : ''}`}
          >
            Analytics
          </Link>
        </div>
      </div>

      {/* Right Section: User Info & Logout */}
      <div className="navbar-right">
        {/* User Info */}
        <div className="user-info">
          <span className="user-avatar">👤</span>
          <span className="user-name">{user?.name}</span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="logout-btn"
          title="Logout from your account"
        >
          <span className="logout-btn-icon">🚪</span>
          <span className="logout-btn-text">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
