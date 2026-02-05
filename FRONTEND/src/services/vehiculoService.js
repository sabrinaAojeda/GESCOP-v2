// FRONTEND/src/services/vehiculoService.js - VERSIÓN COMPLETA Y CORREGIDA
import api from './api';

// Configuración de logging
const LOG_LEVEL = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LOG_LEVEL = import.meta.env.VITE_ENV === 'production' ? LOG_LEVEL.WARN : LOG_LEVEL.DEBUG;

class VehiculoLogger {
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
  // 🎯 OBTENER VEHÍCULOS CON FILTROS
  getVehiculos: async (filters = {}) => {
    const { 
      page = 1, 
      limit = 50, 
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
      VehiculoLogger.info(`Solicitando vehículos: /flota/vehiculos`, params);
      
      // 🎯 LLAMADA CORRECTA CON RUTA /api/flota/vehiculos
      const response = await api.get('/flota/vehiculos', { params });
      
      // 🎯 MANEJO DE RESPUESTA ESTANDARIZADO
      if (response.data) {
        // Formato: { success: true, data: { vehiculos: [], pagination: {} } }
        if (response.data.success !== undefined) {
          VehiculoLogger.debug(`✅ Respuesta exitosa: ${response.data.data?.vehiculos?.length || 0} registros`);
          return response.data;
        }
        // Formato alternativo
        else if (response.data.vehiculos !== undefined) {
          VehiculoLogger.debug(`✅ Respuesta directa: ${response.data.vehiculos.length} registros`);
          return { success: true, data: response.data };
        }
        // Array directo
        else if (Array.isArray(response.data)) {
          VehiculoLogger.debug(`✅ Array directo: ${response.data.length} registros`);
          return { 
            success: true, 
            data: { 
              vehiculos: response.data,
              pagination: {
                current_page: 1,
                per_page: limit,
                total: response.data.length,
                total_pages: 1
              }
            } 
          };
        }
        // Respuesta inesperada
        else {
          VehiculoLogger.warn(`⚠️ Formato de respuesta inesperado:`, response.data);
          return { 
            success: true, 
            data: { 
              vehiculos: [],
              pagination: {
                current_page: 1,
                per_page: limit,
                total: 0,
                total_pages: 0
              }
            } 
          };
        }
      } else {
        VehiculoLogger.warn('Respuesta vacía del servidor');
        throw new Error('Respuesta vacía del servidor');
      }
      
    } catch (error) {
      VehiculoLogger.error('Error en getVehiculos', {
        endpoint: '/flota/vehiculos',
        error: error.message,
        status: error.response?.status,
        params: params
      });
      
      throw error;
    }
  },

  // 🎯 CREAR NUEVO VEHÍCULO
  createVehiculo: async (vehiculoData) => {
    try {
      VehiculoLogger.info('Creando vehículo', { interno: vehiculoData.interno });
      
      // 🎯 LIMPIAR DATOS ANTES DE ENVIAR
      const datosParaEnviar = {
        interno: vehiculoData.interno?.toString().trim() || '',
        año: vehiculoData.año ? parseInt(vehiculoData.año) : null,
        dominio: vehiculoData.dominio?.toString().trim().toUpperCase() || '',
        modelo: vehiculoData.modelo?.toString().trim() || '',
        eq_incorporado: vehiculoData.eq_incorporado?.toString().trim() || '',
        sector: vehiculoData.sector?.toString().trim() || '',
        chofer: vehiculoData.chofer?.toString().trim() || '',
        estado: vehiculoData.estado?.toString().trim() || 'Activo',
        observaciones: vehiculoData.observaciones?.toString().trim() || '',
        vtv_vencimiento: vehiculoData.vtv_vencimiento || null,
        vtv_estado: vehiculoData.vtv_estado || 'Vigente',
        hab_vencimiento: vehiculoData.hab_vencimiento || null,
        hab_estado: vehiculoData.hab_estado || 'Vigente',
        hab_tipo: vehiculoData.hab_tipo?.toString().trim() || '',
        seguro_vencimiento: vehiculoData.seguro_vencimiento || null,
        seguro_estado: vehiculoData.seguro_estado || 'Vigente',
        seguro_tipo: vehiculoData.seguro_tipo?.toString().trim() || '',
        tarjeta_ypf: vehiculoData.tarjeta_ypf?.toString().trim() || '',
        tipo: vehiculoData.tipo?.toString().trim() || 'Rodado'
      };

      VehiculoLogger.debug('Datos limpios para enviar:', datosParaEnviar);
      
      const response = await api.post('/flota/vehiculos', datosParaEnviar);
      
      if (response.data?.success) {
        VehiculoLogger.info('✅ Vehículo creado exitosamente', { interno: vehiculoData.interno });
        return response.data;
      } else {
        const errorMsg = response.data?.message || 'Error al crear vehículo';
        VehiculoLogger.warn('Error en respuesta', response.data);
        throw new Error(errorMsg);
      }
    } catch (error) {
      VehiculoLogger.error('Error en createVehiculo', {
        interno: vehiculoData.interno,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // 🎯 ACTUALIZAR VEHÍCULO
  updateVehiculo: async (interno, vehiculoData) => {
    try {
      VehiculoLogger.info('Actualizando vehículo', { interno });
      
      // 🎯 ENVIAR INTERNO EN EL BODY
      const datosParaEnviar = {
        interno: interno,
        año: vehiculoData.año ? parseInt(vehiculoData.año) : null,
        dominio: vehiculoData.dominio?.toString().trim().toUpperCase() || '',
        modelo: vehiculoData.modelo?.toString().trim() || '',
        eq_incorporado: vehiculoData.eq_incorporado?.toString().trim() || '',
        sector: vehiculoData.sector?.toString().trim() || '',
        chofer: vehiculoData.chofer?.toString().trim() || '',
        estado: vehiculoData.estado?.toString().trim() || 'Activo',
        observaciones: vehiculoData.observaciones?.toString().trim() || '',
        vtv_vencimiento: vehiculoData.vtv_vencimiento || null,
        vtv_estado: vehiculoData.vtv_estado || 'Vigente',
        hab_vencimiento: vehiculoData.hab_vencimiento || null,
        hab_estado: vehiculoData.hab_estado || 'Vigente',
        hab_tipo: vehiculoData.hab_tipo?.toString().trim() || '',
        seguro_vencimiento: vehiculoData.seguro_vencimiento || null,
        seguro_estado: vehiculoData.seguro_estado || 'Vigente',
        seguro_tipo: vehiculoData.seguro_tipo?.toString().trim() || '',
        tarjeta_ypf: vehiculoData.tarjeta_ypf?.toString().trim() || '',
        tipo: vehiculoData.tipo?.toString().trim() || 'Rodado'
      };

      VehiculoLogger.debug('Datos para actualizar:', datosParaEnviar);
      
      const response = await api.put('/flota/vehiculos', datosParaEnviar);
      
      if (response.data?.success) {
        VehiculoLogger.info('✅ Vehículo actualizado exitosamente', { interno });
        return response.data;
      } else {
        const errorMsg = response.data?.message || 'Error al actualizar vehículo';
        VehiculoLogger.warn('Error en respuesta', response.data);
        throw new Error(errorMsg);
      }
    } catch (error) {
      VehiculoLogger.error('Error en updateVehiculo', {
        interno,
        error: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // 🎯 ELIMINAR VEHÍCULO
  deleteVehiculo: async (interno) => {
    try {
      VehiculoLogger.info('Eliminando vehículo', { interno });
      
      // 🎯 ENVIAR INTERNO EN EL BODY PARA DELETE
      const response = await api.delete('/flota/vehiculos', { 
        data: { interno } 
      });
      
      if (response.data?.success) {
        VehiculoLogger.info('✅ Vehículo eliminado exitosamente', { interno });
        return response.data;
      } else {
        const errorMsg = response.data?.message || 'Error al eliminar vehículo';
        VehiculoLogger.warn('Error en respuesta', response.data);
        throw new Error(errorMsg);
      }
    } catch (error) {
      VehiculoLogger.error('Error en deleteVehiculo', {
        interno,
        error: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // 🎯 OBTENER VEHÍCULO POR INTERNO
  getVehiculoByInterno: async (interno) => {
    try {
      VehiculoLogger.info('Obteniendo vehículo por interno', { interno });
      
      const response = await api.get('/flota/vehiculos', {
        params: { interno }
      });
      
      if (response.data?.success) {
        VehiculoLogger.debug('✅ Vehículo obtenido exitosamente');
        return response.data;
      } else {
        VehiculoLogger.warn('Vehículo no encontrado', { interno });
        throw new Error(response.data?.message || 'Vehículo no encontrado');
      }
    } catch (error) {
      VehiculoLogger.error('Error en getVehiculoByInterno', {
        interno,
        error: error.message
      });
      throw error;
    }
  },

  // 🎯 PROBAR CONEXIÓN CON EL SERVICIO
  testConnection: async () => {
    try {
      VehiculoLogger.info('Probando conexión con servicio de vehículos');
      const response = await api.get('/flota/vehiculos', {
        params: { limit: 1 }
      });
      
      if (response.data) {
        VehiculoLogger.info('✅ Conexión exitosa con servicio de vehículos');
        return { success: true, message: 'Servicio de vehículos funcionando' };
      } else {
        return { success: false, message: 'Respuesta vacía del servidor' };
      }
    } catch (error) {
      VehiculoLogger.error('❌ Error probando conexión:', error.message);
      return { 
        success: false, 
        message: `Error de conexión: ${error.message}` 
      };
    }
  },

  // 🎯 CARGA MASIVA DE VEHÍCULOS
  cargaMasivaVehiculos: async (data) => {
    try {
      VehiculoLogger.info('Ejecutando carga masiva de vehículos', { registros: data.length });
      
      const response = await api.post('/flota/carga_masiva_vehiculos', data);
      
      if (response.data?.success) {
        VehiculoLogger.info('✅ Carga masiva exitosa', response.data);
        return {
          success: true,
          message: response.data.message,
          resumen: response.data.resumen,
          detalle_errores: response.data.detalle_errores
        };
      } else {
        const errorMsg = response.data?.message || 'Error en carga masiva';
        VehiculoLogger.warn('Error en carga masiva:', response.data);
        throw new Error(errorMsg);
      }
    } catch (error) {
      VehiculoLogger.error('Error en carga masiva:', {
        error: error.message,
        status: error.response?.status
      });
      throw error;
    }
  }
};

export default vehiculoService;