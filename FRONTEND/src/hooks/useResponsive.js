// src/hooks/useResponsive.js - VERSIÓN MEJORADA
import { useState, useEffect } from 'react';

/**
 * Hook mejorado para detección REAL de dispositivo móvil
 * Combina userAgent, touch detection y screen width
 */
export const useResponsive = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    // Información del dispositivo REAL
    isRealMobile: false,
    isRealTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    orientation: 'landscape',
    
    // Tamaño de ventana (para responsive layout)
    width: window.innerWidth,
    height: window.innerHeight,
    
    // Para compatibilidad con código existente
    isMobile: false,
    isTablet: false,
    screenSize: {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState('');

  // Función para detectar dispositivo REAL
  const detectRealDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Detectar si es dispositivo táctil
    const touchDevice = ('ontouchstart' in window) || 
                       (navigator.maxTouchPoints > 0) || 
                       (navigator.msMaxTouchPoints > 0);
    
    // Detectar dispositivo móvil REAL por userAgent
    const isMobileByAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    // Detectar tablet REAL por userAgent
    const isTabletByAgent = /(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent);
    
    // Lógica combinada
    let isRealMobile = false;
    let isRealTablet = false;
    let isDesktop = true;
    
    if (isMobileByAgent && !isTabletByAgent) {
      isRealMobile = true;
      isDesktop = false;
    } else if (isTabletByAgent) {
      isRealTablet = true;
      isDesktop = false;
    }
    
    // Determinar breakpoint para diseño
    let newBreakpoint = '';
    if (width >= 1400) newBreakpoint = 'xxl';
    else if (width >= 1200) newBreakpoint = 'xl';
    else if (width >= 992) newBreakpoint = 'lg';
    else if (width >= 768) newBreakpoint = 'md';
    else if (width >= 576) newBreakpoint = 'sm';
    else newBreakpoint = 'xs';
    
    setCurrentBreakpoint(newBreakpoint);
    
    setDeviceInfo({
      isRealMobile,
      isRealTablet,
      isDesktop,
      isTouchDevice: touchDevice,
      orientation: width > height ? 'landscape' : 'portrait',
      width,
      height,
      
      // Para compatibilidad (deprecated pero necesario)
      isMobile: width < 768 || isRealMobile,
      isTablet: (width >= 768 && width < 992) || isRealTablet,
      screenSize: {
        width,
        height,
      }
    });
  };

  useEffect(() => {
    // Detectar inmediatamente
    detectRealDevice();
    
    // Event listeners
    const handleResize = () => {
      detectRealDevice();
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  /**
   * Determina si debe mostrar menú hamburguesa
   * REGLA: Solo en dispositivos móviles REALES, no solo por tamaño de ventana
   */
  const shouldShowHamburgerMenu = () => {
    return deviceInfo.isRealMobile || 
           (deviceInfo.isRealTablet && deviceInfo.width < 768);
  };

  /**
   * Determina si sidebar debe estar visible
   * REGLA: En desktop siempre visible, en móvil oculto por defecto
   */
  const shouldShowSidebar = () => {
    return deviceInfo.isDesktop || 
           (!deviceInfo.isRealMobile && deviceInfo.width >= 992);
  };

  /**
   * Determina si es un dispositivo de bolsillo (handheld)
   */
  const isHandheldDevice = () => {
    return deviceInfo.isRealMobile || deviceInfo.isRealTablet;
  };

  return {
    // Información del dispositivo REAL
    ...deviceInfo,
    currentBreakpoint,
    
    // Funciones específicas para GESCOP
    shouldShowHamburgerMenu,
    shouldShowSidebar,
    isHandheldDevice,
    
    // Helper para debugging
    debug: () => ({
      userAgent: navigator.userAgent,
      touchPoints: navigator.maxTouchPoints,
      isRealMobile: deviceInfo.isRealMobile,
      isRealTablet: deviceInfo.isRealTablet,
      isTouchDevice: deviceInfo.isTouchDevice,
      width: deviceInfo.width,
      height: deviceInfo.height,
      orientation: deviceInfo.orientation,
      shouldShowHamburger: shouldShowHamburgerMenu(),
      shouldShowSidebar: shouldShowSidebar()
    }),
    
    // Breakpoints específicos para componentes
    showCardsInsteadOfTable: deviceInfo.isRealMobile || deviceInfo.width < 768,
    compactHeader: deviceInfo.isRealMobile || deviceInfo.width < 576,
    showMobileFilters: deviceInfo.isRealMobile || deviceInfo.width < 768,
    
    // Para modales
    isFullWidthModal: deviceInfo.isRealMobile || deviceInfo.width < 768,
    isSidebarCollapsable: shouldShowHamburgerMenu()
  };
};

export default useResponsive;