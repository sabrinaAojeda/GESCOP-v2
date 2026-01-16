// src/services/vehiculoService.js - VERSIÓN DEFINITIVA
import api from './api';

// Configuración de logging permanente
const LOG_LEVEL = {
  ERROR: 0,
  WARN: 1, 
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LOG_LEVEL = import.meta.env.VITE_ENV === 'production' ? LOG_LEVEL.WARN : LOG_LEVEL.DEBUG;

class Logger {
  static error(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.ERROR) {
      console.error(`❌ [VEHICULO_SERVICE] ${message}`, data || '');
    }
  }

  static warn(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.WARN) {
      console.warn(`⚠️ [VEHICULO_SERVICE] ${message}`, data || '');
    }
  }

  static info(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.INFO) {
      console.info(`ℹ️ [VEHICULO_SERVICE] ${message}`, data || '');
    }
  }

  static debug(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.DEBUG) {
      console.log(`🔍 [VEHICULO_SERVICE] ${message}`, data || '');
    }
  }
}

const vehiculoService = {
  // 🎯 OBTENER VEHÍCULOS CON FILTROS (CORREGIDO)
  getVehiculos: async (filters = {}) => {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      sector = '', 
      estado = '',
      tipo = '' 
    } = filters;
    
    // 🎯 PARÁMETROS CORRECTOS para el backend
    const params = {
      page,
      limit,
      ...(search && { search }),
      ...(sector && { sector }),
      ...(estado && { estado }),
      ...(tipo && { tipo })
    };

    try {
      Logger.info(`Solicitando vehículos: /flota/vehiculos`, params);
      
      // 🎯 LLAMADA CORRECTA - usando api.get con params
      const response = await api.get('/flota/vehiculos', { params });
      
      // 🎯 MANEJO DE RESPUESTA ESTANDARIZADO
      if (response.data) {
        // Verificar diferentes formatos de respuesta
        if (response.data.success !== undefined) {
          Logger.debug(`Respuesta exitosa: ${response.data.data?.vehiculos?.length || 0} registros`);
          return response.data; // Formato: { success: true, data: {...} }
        } else if (response.data.vehiculos !== undefined) {
          Logger.debug(`Respuesta directa: ${response.data.vehiculos.length || 0} registros`);
          return { success: true, data: response.data }; // Formato: { vehiculos: [], pagination: {} }
        } else {
          Logger.debug(`Respuesta genérica: ${response.data.length || 0} registros`);
          return { success: true, data: { vehiculos: response.data } }; // Formato: []
        }
      } else {
        Logger.warn('Respuesta vacía del servidor');
        throw new Error('Respuesta vacía del servidor');
      }
      
    } catch (error) {
      Logger.error('Error en getVehiculos', {
        endpoint: '/flota/vehiculos',
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // 🎯 RE-LANZAR ERROR PARA QUE LO MANEJE EL HOOK
      throw error;
    }
  },

  // 🎯 CREAR NUEVO VEHÍCULO
  createVehiculo: async (vehiculoData) => {
    try {
      Logger.info('Creando vehículo', { interno: vehiculoData.interno });
      const response = await api.post('/flota/vehiculos', vehiculoData);
      
      if (response.data?.success) {
        Logger.info('Vehículo creado exitosamente', { interno: vehiculoData.interno });
        return response.data;
      } else {
        Logger.warn('Error en respuesta al crear vehículo', response.data);
        throw new Error(response.data?.message || 'Error al crear vehículo');
      }
    } catch (error) {
      Logger.error('Error en createVehiculo', {
        interno: vehiculoData.interno,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // 🎯 ACTUALIZAR VEHÍCULO (CORREGIDO)
  updateVehiculo: async (interno, vehiculoData) => {
    try {
      Logger.info('Actualizando vehículo', { interno });
      
      // 🎯 ENVIAR EL INTERNO EN EL BODY, NO EN LA URL
      const dataToSend = { interno, ...vehiculoData };
      const response = await api.put('/flota/vehiculos', dataToSend);
      
      if (response.data?.success) {
        Logger.info('Vehículo actualizado exitosamente', { interno });
        return response.data;
      } else {
        Logger.warn('Error al actualizar vehículo', response.data);
        throw new Error(response.data?.message || 'Error al actualizar vehículo');
      }
    } catch (error) {
      Logger.error('Error en updateVehiculo', {
        interno,
        error: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // 🎯 ELIMINAR VEHÍCULO (CORREGIDO)
  deleteVehiculo: async (interno) => {
    try {
      Logger.info('Eliminando vehículo', { interno });
      
      // 🎯 ENVIAR EL INTERNO EN EL BODY PARA DELETE
      const response = await api.delete('/flota/vehiculos', { 
        data: { interno } 
      });
      
      if (response.data?.success) {
        Logger.info('Vehículo eliminado exitosamente', { interno });
        return response.data;
      } else {
        Logger.warn('Error al eliminar vehículo', response.data);
        throw new Error(response.data?.message || 'Error al eliminar vehículo');
      }
    } catch (error) {
      Logger.error('Error en deleteVehiculo', {
        interno,
        error: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // 🎯 NUEVO: OBTENER VEHÍCULO POR INTERNO
  getVehiculoByInterno: async (interno) => {
    try {
      Logger.info('Obteniendo vehículo por interno', { interno });
      const response = await api.get(`/flota/vehiculos/${interno}`);
      
      if (response.data?.success) {
        Logger.debug('Vehículo obtenido exitosamente');
        return response.data;
      } else {
        Logger.warn('Vehículo no encontrado', { interno });
        throw new Error(response.data?.message || 'Vehículo no encontrado');
      }
    } catch (error) {
      Logger.error('Error en getVehiculoByInterno', {
        interno,
        error: error.message
      });
      throw error;
    }
  }
};

export { vehiculoService, Logger };