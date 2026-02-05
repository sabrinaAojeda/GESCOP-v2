// FRONTEND/src/hooks/useDashboard.js - HOOK COMPLETO PARA DASHBOARD
import { useState, useEffect, useCallback, useRef } from 'react';
import dashboardService from '../services/dashboardService';

const HookLogger = {
  info: (message, data = null) => {
    console.info(`🎯 [useDashboard] ${message}`, data || '');
  },
  error: (message, data = null) => {
    console.error(`💥 [useDashboard] ${message}`, data || '');
  },
  debug: (message, data = null) => {
    console.log(`🔍 [useDashboard] ${message}`, data || '');
  }
};

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Datos del dashboard
  const [estadisticas, setEstadisticas] = useState({
    totalVehiculos: 0,
    vehiculosActivos: 0,
    vehiculosMantenimiento: 0,
    totalPersonal: 0,
    personalActivo: 0,
    totalProveedores: 0,
    proveedoresActivos: 0,
    alertasVencimientos: 0
  });

  const [resumen, setResumen] = useState({
    vehiculosPorSector: [],
    vehiculosPorTipo: [],
    personalPorSector: [],
    ultimosMovimientos: []
  });

  const [alertas, setAlertas] = useState([]);
  const [vencimientos, setVencimientos] = useState([]);

  const mountedRef = useRef(true);

  // 🎯 CARGAR DATOS DEL DASHBOARD
  const loadDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      HookLogger.info('Cargando datos del dashboard');

      const result = await dashboardService.getDashboardData();

      if (mountedRef.current) {
        if (result.success) {
          const { estadisticas: est, resumen: res, alertas: al, vencimientos: ven } = result.data;

          if (est) setEstadisticas(est);
          if (res) setResumen(res);
          if (al) setAlertas(al);
          if (ven) setVencimientos(ven);

          HookLogger.info('✅ Datos del dashboard cargados correctamente');
        } else {
          throw new Error(result.error || 'Error al cargar datos del dashboard');
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMsg = err.message || 'Error al cargar los datos del dashboard';
        HookLogger.error('Error cargando dashboard:', {
          error: err.message,
          userMessage: errorMsg
        });

        setError(errorMsg);
      }
    } finally {
      if (mountedRef.current && showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // 🎯 CARGAR ESTADÍSTICAS
  const loadEstadisticas = useCallback(async () => {
    try {
      const result = await dashboardService.getEstadisticas();

      if (result.success && result.data) {
        setEstadisticas(result.data);
        HookLogger.info('✅ Estadísticas cargadas');
      }
    } catch (err) {
      HookLogger.error('Error cargando estadísticas:', err);
    }
  }, []);

  // 🎯 CARGAR RESUMEN
  const loadResumen = useCallback(async () => {
    try {
      const result = await dashboardService.getResumen();

      if (result.success && result.data) {
        setResumen(result.data);
        HookLogger.info('✅ Resumen cargado');
      }
    } catch (err) {
      HookLogger.error('Error cargando resumen:', err);
    }
  }, []);

  // 🎯 CARGAR ALERTAS
  const loadAlertas = useCallback(async (tipo = null) => {
    try {
      const result = await dashboardService.getAlertas(tipo);

      if (result.success && result.data) {
        setAlertas(result.data);
        HookLogger.info(`✅ Alertas cargadas: ${result.data.length}`);
      }
    } catch (err) {
      HookLogger.error('Error cargando alertas:', err);
    }
  }, []);

  // 🎯 CARGAR VENCIMIENTOS
  const loadVencimientos = useCallback(async (dias = 30) => {
    try {
      const result = await dashboardService.getVencimientos(dias);

      if (result.success && result.data) {
        setVencimientos(result.data);
        HookLogger.info(`✅ Vencimientos cargados: ${result.data.length}`);
      }
    } catch (err) {
      HookLogger.error('Error cargando vencimientos:', err);
    }
  }, []);

  // 🎯 REFRESCAR DATOS
  const refreshData = useCallback(() => {
    HookLogger.info('🔄 Refrescando datos del dashboard');
    setRefreshTrigger(prev => prev + 1);
    loadDashboardData(true);
  }, [loadDashboardData]);

  // 🎯 CALCULAR ESTADÍSTICAS LOCALES
  const calculateLocalStats = useCallback(() => {
    const totalAlertas = alertas.length;
    const alertasCriticas = alertas.filter(a => a.prioridad === 'critica' || a.prioridad === 'alta').length;
    const vencimientosProximos = vencimientos.filter(v => {
      if (!v.dias_restantes) return false;
      return v.dias_restantes <= 7;
    }).length;

    return {
      totalAlertas,
      alertasCriticas,
      vencimientosProximos,
      totalItems: estadisticas.totalVehiculos + estadisticas.totalPersonal
    };
  }, [alertas, vencimientos, estadisticas]);

  // 🎯 CARGA INICIAL
  useEffect(() => {
    mountedRef.current = true;
    HookLogger.info('Hook mounted - iniciando carga inicial del dashboard');
    loadDashboardData();

    return () => {
      mountedRef.current = false;
      HookLogger.debug('Hook unmounted');
    };
  }, [loadDashboardData, refreshTrigger]);

  // 🎯 RETORNO DEL HOOK
  return {
    // Estados
    loading,
    error,
    estadisticas,
    resumen,
    alertas,
    vencimientos,

    // Funciones de carga
    loadDashboardData,
    loadEstadisticas,
    loadResumen,
    loadAlertas,
    loadVencimientos,
    refreshData,

    // Utilidades
    calculateLocalStats,
    hasData: Object.keys(estadisticas).length > 0 || alertas.length > 0 || vencimientos.length > 0,

    // Datos calculados
    stats: calculateLocalStats()
  };
};

export default useDashboard;
