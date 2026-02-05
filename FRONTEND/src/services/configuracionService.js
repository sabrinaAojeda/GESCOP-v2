// FRONTEND/src/services/configuracionService.js - SERVICIO DE CONFIGURACIÓN
import api from './api';

const configuracionService = {
  // Obtener configuración
  getConfiguracion: async () => {
    try {
      console.log('📥 [ConfiguracionService] Obteniendo configuración...');
      const response = await api.get('/herramientas/configuracion');
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || {}
        };
      } else {
        return {
          success: false,
          data: {},
          error: response.data?.error || 'Error al obtener configuración'
        };
      }
    } catch (error) {
      console.error('❌ [ConfiguracionService] Error:', error);
      return {
        success: false,
        data: {},
        error: error.message
      };
    }
  },

  // Guardar configuración
  saveConfiguracion: async (configData) => {
    try {
      console.log('📤 [ConfiguracionService] Guardando configuración:', configData);
      const response = await api.put('/herramientas/configuracion', configData);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Configuración guardada exitosamente'
        };
      } else {
        return {
          success: false,
          error: response.data?.error || 'Error al guardar configuración'
        };
      }
    } catch (error) {
      console.error('❌ [ConfiguracionService] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Obtener parámetros
  getParametros: async () => {
    try {
      const response = await api.get('/parametros');
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('❌ [ConfiguracionService] Error obteniendo parámetros:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  // Guardar parámetro
  saveParametro: async (parametroData) => {
    try {
      const response = await api.post('/parametros', parametroData);
      return {
        success: true,
        message: response.data?.message || 'Parámetro guardado exitosamente'
      };
    } catch (error) {
      console.error('❌ [ConfiguracionService] Error guardando parámetro:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default configuracionService;
