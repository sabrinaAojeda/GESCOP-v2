// src/layouts/MainLayout.jsx - VERSIÓN OPTIMIZADA
import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import useResponsive from '../hooks/useResponsive';
import './MainLayout.css';

const MainLayout = () => {
  const responsive = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(responsive.shouldShowSidebar());

  // Usar callbacks memoizados para evitar re-renderizados
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    if (responsive.shouldShowHamburgerMenu()) {
      setSidebarOpen(false);
    }
  }, [responsive.shouldShowHamburgerMenu]);

  // Efecto para manejar cambios en responsive
  useEffect(() => {
    if (responsive.shouldShowSidebar() && !sidebarOpen) {
      setSidebarOpen(true);
    } else if (responsive.shouldShowHamburgerMenu() && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [responsive, sidebarOpen, responsive.shouldShowSidebar, responsive.shouldShowHamburgerMenu]);

  return (
    <div className="app-container">
      {/* Overlay para móviles */}
      {responsive.shouldShowHamburgerMenu() && sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
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