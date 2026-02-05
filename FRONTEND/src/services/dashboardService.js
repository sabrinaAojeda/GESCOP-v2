// FRONTEND/src/services/dashboardService.js - SERVICIO COMPLETO DE DASHBOARD
import api from './api';

const LOG_LEVEL = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LOG_LEVEL = import.meta.env.VITE_ENV === 'production' ? LOG_LEVEL.WARN : LOG_LEVEL.DEBUG;

class DashboardLogger {
  static error(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.ERROR) {
      console.error(`❌ [DASHBOARD_SERVICE] ${message}`, data || '');
    }
  }

  static warn(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.WARN) {
      console.warn(`⚠️ [DASHBOARD_SERVICE] ${message}`, data || '');
    }
  }

  static info(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.INFO) {
      console.info(`ℹ️ [DASHBOARD_SERVICE] ${message}`, data || '');
    }
  }

  static debug(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.DEBUG) {
      console.log(`🔍 [DASHBOARD_SERVICE] ${message}`, data || '');
    }
  }
}

const dashboardService = {
  // 🎯 OBTENER ESTADÍSTICAS GENERALES
  getEstadisticas: async () => {
    try {
      DashboardLogger.info('Obteniendo estadísticas del dashboard');
      
      const response = await api.get('/dashboard/estadisticas');
      
      DashboardLogger.debug('Respuesta estadísticas:', response.data);
      
      if (response.data && response.data.success !== false) {
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Estadísticas obtenidas'
        };
      } else {
        throw new Error(response.data?.message || 'Error al obtener estadísticas');
      }
    } catch (error) {
      DashboardLogger.error('Error obteniendo estadísticas:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  },

  // 🎯 OBTENER RESUMEN DEL DASHBOARD
  getResumen: async () => {
    try {
      DashboardLogger.info('Obteniendo resumen del dashboard');
      
      const response = await api.get('/dashboard/resumen');
      
      DashboardLogger.debug('Respuesta resumen:', response.data);
      
      if (response.data && response.data.success !== false) {
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Resumen obtenido'
        };
      } else {
        throw new Error(response.data?.message || 'Error al obtener resumen');
      }
    } catch (error) {
      DashboardLogger.error('Error obteniendo resumen:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  },

  // 🎯 OBTENER ALERTAS DEL DASHBOARD
  getAlertas: async (tipo = null) => {
    try {
      DashboardLogger.info('Obteniendo alertas del dashboard');
      
      const params = tipo ? { tipo } : {};
      const response = await api.get('/dashboard/alertas_dashboard', { params });
      
      DashboardLogger.debug('Respuesta alertas:', response.data);
      
      if (response.data && response.data.success !== false) {
        return {
          success: true,
          data: response.data.data || response.data.alertas || [],
          message: response.data.message || 'Alertas obtenidas'
        };
      } else {
        throw new Error(response.data?.message || 'Error al obtener alertas');
      }
    } catch (error) {
      DashboardLogger.error('Error obteniendo alertas:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  // 🎯 OBTENER VENCIMIENTOS PRÓXIMOS
  getVencimientos: async (dias = 30) => {
    try {
      DashboardLogger.info(`Obteniendo vencimientos próximos (${dias} días)`);
      
      const response = await api.get('/dashboard/vencimientos', {
        params: { dias }
      });
      
      DashboardLogger.debug('Respuesta vencimientos:', response.data);
      
      if (response.data && response.data.success !== false) {
        return {
          success: true,
          data: response.data.data || response.data.vencimientos || [],
          message: response.data.message || 'Vencimientos obtenidos'
        };
      } else {
        throw new Error(response.data?.message || 'Error al obtener vencimientos');
      }
    } catch (error) {
      DashboardLogger.error('Error obteniendo vencimientos:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  // 🎯 OBTENER DATOS COMPLETOS DEL DASHBOARD
  getDashboardData: async () => {
    try {
      DashboardLogger.info('Obteniendo datos completos del dashboard');
      
      // Obtener todos los datos en paralelo
      const [estadisticas, resumen, alertas, vencimientos] = await Promise.all([
        dashboardService.getEstadisticas(),
        dashboardService.getResumen(),
        dashboardService.getAlertas(),
        dashboardService.getVencimientos(30)
      ]);
      
      return {
        success: true,
        data: {
          estadisticas: estadisticas.data || {},
          resumen: resumen.data || {},
          alertas: alertas.data || [],
          vencimientos: vencimientos.data || []
        },
        message: 'Datos del dashboard obtenidos correctamente'
      };
    } catch (error) {
      DashboardLogger.error('Error obteniendo datos completos:', error);
      return {
        success: false,
        data: {
          estadisticas: {},
          resumen: {},
          alertas: [],
          vencimientos: []
        },
        error: error.message
      };
    }
  }
};

export default dashboardService;
