// src/components/Header/Header.jsx - VERSIÓN MEJORADA Y COMPACTA
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import './Header.css';

const Header = ({ onMenuClick, sidebarOpen, shouldShowHamburger }) => {
  const { user, logout } = useAuth();
  const responsive = useResponsive();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Función para manejar logout
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // Función para manejar búsqueda global
  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Buscando:', searchQuery);
    // Aquí se implementaría la búsqueda global
  };

  return (
    <header className="top-header">
      {/* Parte izquierda - Menú hamburguesa SOLO en móviles */}
      <div className="header-left">
        {shouldShowHamburger && (
          <button 
            className="menu-toggle"
            onClick={onMenuClick}
            aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        )}

        {/* Información del usuario */}
        <div className="header-user-info">
          <span className="header-greeting">Bienvenido/a</span>
          <span className="header-username">
            {user?.name || 'Usuario'}
          </span>
        </div>
      </div>

      {/* Búsqueda global */}
      <form className="search-bar" onSubmit={handleSearch}>
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar en el sistema..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Acciones de usuario */}
      <div className="user-actions">
        {/* Notificaciones */}
        <div className="notification-icon" title="Notificaciones">
          <span className="bell-icon">🔔</span>
          <span className="notification-badge">3</span>
        </div>

        {/* Perfil de usuario - Desktop */}
        {!responsive.shouldShowHamburgerMenu() && user && (
          <>
            <div className="user-profile">
              <div className="profile-avatar">
                <span className="avatar-icon">
                  {user.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="profile-info">
                <span className="profile-name">{user.name}</span>
                <span className="profile-role">
                  {user.role === 'admin' ? 'Administrador' : 'Empleado'}
                </span>
              </div>
            </div>

            <button className="btn-logout" onClick={handleLogout}>
              <span>🚪</span> Salir
            </button>
          </>
        )}

        {/* Menú de usuario - Mobile */}
        {responsive.shouldShowHamburgerMenu() && user && (
          <div className="mobile-user-menu">
            <button 
              className="mobile-user-toggle"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="Menú de usuario"
            >
              <div className="profile-avatar">
                <span className="avatar-icon">
                  {user.name?.charAt(0) || 'U'}
                </span>
              </div>
            </button>

            {showUserMenu && (
              <div className="mobile-user-dropdown">
                <div className="mobile-user-info">
                  <div className="profile-name">{user.name}</div>
                  <div className="profile-role">
                    {user.role === 'admin' ? 'Administrador' : 'Empleado'}
                  </div>
                </div>
                <button className="mobile-logout-btn" onClick={handleLogout}>
                  <span>🚪</span> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;