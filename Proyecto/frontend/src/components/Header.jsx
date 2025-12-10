import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <img src="/logo2.jpeg" alt="Pastelería Java" className="logo-icon" />
          <span className="logo-text">Pastelería Java</span>
        </Link>

        {/* Navigation */}
        <nav className="nav-menu">
          <Link to="/" className="nav-link">Inicio</Link>

          {user && (
            <>
              {hasRole('Admin') && (
                <>
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/product-management" className="nav-link">Gestionar Productos</Link>
                  <Link to="/sales" className="nav-link">Historial Ventas</Link>
                </>
              )}
              {hasRole('Employee') && (
                <>
                  <Link to="/products" className="nav-link">Productos</Link>
                  <Link to="/sales" className="nav-link">Mis Ventas</Link>
                </>
              )}
              {user.type === 'customer' && (
                <Link to="/products" className="nav-link">
                  Carrito
                  {getCartCount() > 0 && (
                    <span className="cart-count">{getCartCount()}</span>
                  )}
                </Link>
              )}
            </>
          )}
        </nav>

        {/* User Menu */}
        <div className="user-section">
          {user ? (
            <div className="user-menu">
              <button
                className="user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-icon">👤</span>
                <span className="user-name">{user.nombre}</span>
                <span className="dropdown-arrow">▼</span>
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <p className="user-email">{user.email}</p>
                    <span className={`user-role ${user.rol || 'customer'}`}>
                      {user.rol || 'Cliente'}
                    </span>
                  </div>
                  <hr />
                  <button className="dropdown-item" onClick={handleLogout}>
                    🚪 Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                className="btn-login"
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </button>
              <button
                className="btn-register"
                onClick={() => navigate('/register')}
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showUserMenu && (
        <div
          className="menu-overlay"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;