// src/hooks/useResponsive.js - VERSIÓN CORREGIDA
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook corregido para detección de dispositivo móvil
 * Con cleanup adecuado de event listeners
 */
export const useResponsive = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isRealMobile: false,
    isRealTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    orientation: 'landscape',
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    screenSize: {
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 0,
    }
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState('');
  
  // Usar refs para evitar re-renderizados innecesarios
  const initialized = useRef(false);
  
  const detectRealDevice = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const userAgent = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const touchDevice = ('ontouchstart' in window) || 
                       (navigator.maxTouchPoints > 0) || 
                       (navigator.msMaxTouchPoints > 0);
    
    const isMobileByAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTabletByAgent = /(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent);
    
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
      isMobile: width < 768 || isRealMobile,
      isTablet: (width >= 768 && width < 992) || isRealTablet,
      screenSize: { width, height }
    });
  }, []);

  useEffect(() => {
    // Evitar inicialización múltiple
    if (initialized.current) {
      detectRealDevice();
      return;
    }
    initialized.current = true;
    
    detectRealDevice();
    
    const handleResize = () => {
      detectRealDevice();
    };
    
    const handleOrientationChange = () => {
      // Pequeño delay para permitir que el navegador actualice las dimensiones
      setTimeout(detectRealDevice, 100);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [detectRealDevice]);

  const shouldShowHamburgerMenu = useCallback(() => {
    return deviceInfo.isRealMobile || 
           (deviceInfo.isRealTablet && deviceInfo.width < 768);
  }, [deviceInfo.isRealMobile, deviceInfo.isRealTablet, deviceInfo.width]);

  const shouldShowSidebar = useCallback(() => {
    return deviceInfo.isDesktop || 
           (!deviceInfo.isRealMobile && deviceInfo.width >= 992);
  }, [deviceInfo.isDesktop, deviceInfo.isRealMobile, deviceInfo.width]);

  const isHandheldDevice = useCallback(() => {
    return deviceInfo.isRealMobile || deviceInfo.isRealTablet;
  }, [deviceInfo.isRealMobile, deviceInfo.isRealTablet]);

  return {
    ...deviceInfo,
    currentBreakpoint,
    shouldShowHamburgerMenu,
    shouldShowSidebar,
    isHandheldDevice,
    showCardsInsteadOfTable: deviceInfo.isRealMobile || deviceInfo.width < 768,
    compactHeader: deviceInfo.isRealMobile || deviceInfo.width < 576,
    showMobileFilters: deviceInfo.isRealMobile || deviceInfo.width < 768,
    isFullWidthModal: deviceInfo.isRealMobile || deviceInfo.width < 768,
    isSidebarCollapsable: shouldShowHamburgerMenu()
  };
};

export default useResponsive;