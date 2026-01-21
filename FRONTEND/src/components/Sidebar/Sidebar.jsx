// src/components/Sidebar/Sidebar.jsx - VERSIÓN SIN SCROLLBAR
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useResponsive from '../../hooks/useResponsive';
import './Sidebar.css';

const Sidebar = ({ onClose }) => {
  const [flotaExpanded, setFlotaExpanded] = useState(false);
  const [herramientasExpanded, setHerramientasExpanded] = useState(false);
  const location = useLocation();
  const responsive = useResponsive();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isFlotaActive = () => {
    return location.pathname.includes('/flota');
  };

  const isHerramientasActive = () => {
    return location.pathname.includes('/reportes') || 
           location.pathname.includes('/alertas') || 
           location.pathname.includes('/configuracion');
  };

  const handleNavClick = () => {
    if (responsive.shouldShowHamburgerMenu() && onClose) {
      onClose();
    }
  };

  // Auto-expandir submenús cuando estamos en esa sección
  React.useEffect(() => {
    if (isFlotaActive()) {
      setFlotaExpanded(true);
    }
    if (isHerramientasActive()) {
      setHerramientasExpanded(true);
    }
  }, [location.pathname]);

  return (
    <nav className={`sidebar ${responsive.shouldShowHamburgerMenu() ? 'mobile' : 'desktop'}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <img 
            src="/logo.png" 
            alt="GESCOP Logo" 
            className="logo-img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div class="logo-fallback">
                  <span class="logo-icon">🚗</span>
                  <div class="logo-text">
                    <div class="logo-title">GESCOP</div>
                    <div class="logo-subtitle">NAVEGACIÓN</div>
                  </div>
                </div>
              `;
            }}
          />
          <div className="logo-text">
            <div className="logo-title">  GESCOP</div>
          </div>
        </div>
        
        {responsive.shouldShowHamburgerMenu() && (
          <button 
            className="close-sidebar" 
            onClick={onClose} 
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        )}
      </div>

      {/* Contenedor de navegación sin scrollbar visible */}
      <div className="nav-container">
        <div className="nav-section">
          <div className="nav-title">MENÚ PRINCIPAL</div>
          
          <Link 
            to="/dashboard" 
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Dashboard</span>
          </Link>

          {/* Flota Vehicular con submenú */}
          <div 
            className={`nav-item has-submenu ${isFlotaActive() ? 'active' : ''} ${flotaExpanded ? 'expanded' : ''}`}
            onClick={() => setFlotaExpanded(!flotaExpanded)}
          >
            <span className="nav-icon">🚗</span>
            <span className="nav-label">Flota Vehicular</span>
            <span className="submenu-arrow">{flotaExpanded ? '▸' : '▸'}</span>
          </div>
          
          <div className={`submenu ${flotaExpanded ? 'expanded' : ''}`}>
            <Link 
              to="/flota/rodado-maquinarias" 
              className={`submenu-item ${isActive('/flota/rodado-maquinarias') ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <span className="submenu-icon">🚛</span>
              <span>Rodado y Maquinarias</span>
            </Link>
            <Link 
              to="/flota/listado-vehiculos" 
              className={`submenu-item ${isActive('/flota/listado-vehiculos') ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <span className="submenu-icon">📋</span>
              <span>Listado de Vehículos</span>
            </Link>
            <Link 
              to="/flota/vehiculos-vendidos" 
              className={`submenu-item ${isActive('/flota/vehiculos-vendidos') ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <span className="submenu-icon">💰</span>
              <span>Vehículos Vendidos</span>
            </Link>
            <Link 
              to="/flota/equipamiento-vehiculos" 
              className={`submenu-item ${isActive('/flota/equipamiento-vehiculos') ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <span className="submenu-icon">🔧</span>
              <span>Equipamiento</span>
            </Link>
          </div>

          <Link 
            to="/personal" 
            className={`nav-item ${isActive('/personal') ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-label">Personal</span>
          </Link>

          <Link 
            to="/sedes" 
            className={`nav-item ${isActive('/sedes') ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon">🏢</span>
            <span className="nav-label">Sedes/Empresas</span>
          </Link>

          <Link 
            to="/proveedores" 
            className={`nav-item ${isActive('/proveedores') ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon">🤝</span>
            <span className="nav-label">Proveedores</span>
          </Link>
        </div>

        <div className="nav-section">
          <div className="nav-title">ADMINITSTRACION DEL SISTEMA</div>
          
          <div 
            className={`nav-item has-submenu ${isHerramientasActive() ? 'active' : ''} ${herramientasExpanded ? 'expanded' : ''}`}
            onClick={() => setHerramientasExpanded(!herramientasExpanded)}
          >
            <span className="nav-icon">🔧</span>
            <span className="nav-label">Ajustes</span>
            <span className="submenu-arrow">{herramientasExpanded ? '▸' : '▸'}</span>
          </div>
          
          <div className={`submenu ${herramientasExpanded ? 'expanded' : ''}`}>
            <Link 
              to="/reportes" 
              className={`submenu-item ${isActive('/reportes') ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <span className="submenu-icon">📈</span>
              <span>Reportes</span>
            </Link>
            <Link 
              to="/alertas" 
              className={`submenu-item ${isActive('/alertas') ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <span className="submenu-icon">🚨</span>
              <span>Alertas</span>
            </Link>
            <Link 
              to="/configuracion" 
              className={`submenu-item ${isActive('/configuracion') ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <span className="submenu-icon">⚙️</span>
              <span>Configuración</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="version-info">
          <span className="version-label">Versión</span>
          <span className="version-number">2.1.0</span>
        </div>
        <div className="copyright">
          © 2026 GESCOP
           Gestión Integral
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;