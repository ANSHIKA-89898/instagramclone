import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Instagram Clone
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">
            🏠 Home
          </Link>
          <Link to="/search" className="nav-link">
            🔎 Search
          </Link>
          <Link to="/create" className="nav-link">
            ➕ Create
          </Link>
          <Link to={`/profile/${user?.id}`} className="nav-link">
            👤 Profile
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
