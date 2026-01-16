// src/layouts/MainLayout.jsx - VERSIÓN CORREGIDA
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import useResponsive from '../hooks/useResponsive';
import './MainLayout.css';

const MainLayout = () => {
  const responsive = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(responsive.shouldShowSidebar());

  // Efecto para manejar cambios en responsive
  useEffect(() => {
    // Si estamos en desktop y sidebar está cerrada, abrirla
    if (responsive.shouldShowSidebar() && !sidebarOpen) {
      setSidebarOpen(true);
    }
    // Si estamos en móvil y sidebar está abierta, cerrarla
    else if (responsive.shouldShowHamburgerMenu() && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [responsive, sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (responsive.shouldShowHamburgerMenu()) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="app-container">
      {/* Overlay para móviles - SOLO en dispositivos móviles REALES */}
      {responsive.shouldShowHamburgerMenu() && sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Sidebar - VISIBLE según reglas */}
      <div 
        className={`sidebar ${sidebarOpen ? 'open' : 'closed'} ${
          responsive.shouldShowHamburgerMenu() ? 'mobile' : 'desktop'
        }`}
      >
        <Sidebar onClose={closeSidebar} />
      </div>

      {/* Main Content */}
      <div 
        className={`main-content ${
          responsive.shouldShowHamburgerMenu() && !sidebarOpen ? 'expanded' : ''
        }`}
        style={{
          marginLeft: responsive.shouldShowHamburgerMenu() ? 0 : (sidebarOpen ? '250px' : '0')
        }}
      >
        <Header 
          onMenuClick={toggleSidebar} 
          sidebarOpen={sidebarOpen}
          shouldShowHamburger={responsive.shouldShowHamburgerMenu()}
        />
        <div 
          className="content-area" 
          onClick={responsive.shouldShowHamburgerMenu() ? closeSidebar : undefined}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;