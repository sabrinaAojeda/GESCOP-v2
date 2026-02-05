/* src/components/Header/Header.jsx - VERSIÓN ORIGINAL */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Búsqueda global básica
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="top-header">
      {/* Parte izquierda */}
      <div className="header-left">
        {/* Menú hamburguesa - visible solo en móviles */}
        <button 
          className="menu-toggle" 
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
        
        {/* Información del usuario */}
        <div className="header-user-info">
          <span className="header-greeting">Bienvenido</span>
          <span className="header-username">
            {user?.nombre ? `${user.nombre} ${user.apellido || ''}` : 'Usuario'}
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
        <div className="user-profile">
          <div className="profile-avatar">
            <span className="avatar-icon">
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <div className="profile-info">
            <span className="profile-name">
              {user?.nombre ? `${user.nombre} ${user.apellido || ''}` : 'Usuario'}
            </span>
            <span className="profile-role">{user?.rol || 'Usuario'}</span>
          </div>
        </div>

        {/* Botón logout Desktop */}
        <button 
          className="btn-logout" 
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <span>🚪</span>
          <span className="btn-text">Salir</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
