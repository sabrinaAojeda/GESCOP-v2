// FRONTEND/src/services/proveedoresService.js - VERSIÓN ESTANDARIZADA
import api from './api';

// Configuración de logging
const LOG_LEVEL = {
  ERROR: 0,
  WARN: 1, 
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LOG_LEVEL = import.meta.env.VITE_ENV === 'production' ? LOG_LEVEL.WARN : LOG_LEVEL.DEBUG;

class ProveedoresLogger {
  static error(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.ERROR) {
      console.error(`❌ [PROVEEDORES_SERVICE] ${message}`, data || '');
    }
  }

  static warn(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.WARN) {
      console.warn(`⚠️ [PROVEEDORES_SERVICE] ${message}`, data || '');
    }
  }

  static info(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.INFO) {
      console.info(`ℹ️ [PROVEEDORES_SERVICE] ${message}`, data || '');
    }
  }

  static debug(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.DEBUG) {
      console.log(`🔍 [PROVEEDORES_SERVICE] ${message}`, data || '');
    }
  }
}

const proveedoresService = {
  // 🎯 OBTENER PROVEEDORES
  getProveedores: async (params = {}) => {
    try {
      ProveedoresLogger.info(`Solicitando proveedores: /proveedores`, params);
      
      const response = await api.get('/proveedores', {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || '',
          rubro: params.rubro || '',
          estado: params.estado || '',
          localidad: params.localidad || '',
          ...params
        }
      });
      
      ProveedoresLogger.info(`✅ Proveedores obtenidos: ${response.data?.data?.length || 0} registros`);
      return response.data;
      
    } catch (error) {
      ProveedoresLogger.error('Error en getProveedores', {
        url: '/proveedores',
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // 🎯 BUSCAR PROVEEDORES (autocomplete)
  searchProveedores: async (searchTerm) => {
    try {
      ProveedoresLogger.debug(`Buscando proveedores: ${searchTerm}`);
      const response = await api.get('/proveedores/search', {
        params: { q: searchTerm }
      });
      return response.data;
    } catch (error) {
      ProveedoresLogger.error('Error buscando proveedores:', error);
      throw error;
    }
  },

  // 🎯 CREAR PROVEEDOR
  createProveedor: async (proveedorData) => {
    try {
      ProveedoresLogger.info('Creando proveedor:', proveedorData);
      const response = await api.post('/proveedores/create', proveedorData);
      
      if (response.data?.success) {
        ProveedoresLogger.info('✅ Proveedor creado exitosamente');
        return response.data;
      } else {
        ProveedoresLogger.warn('Error en respuesta al crear proveedor', response.data);
        throw new Error(response.data?.message || 'Error al crear proveedor');
      }
    } catch (error) {
      ProveedoresLogger.error('Error creando proveedor:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // 🎯 ACTUALIZAR PROVEEDOR
  updateProveedor: async (id, proveedorData) => {
    try {
      ProveedoresLogger.info(`Actualizando proveedor ID: ${id}`, proveedorData);
      const response = await api.put(`/proveedores/update`, { id, ...proveedorData });
      
      if (response.data?.success) {
        ProveedoresLogger.info('✅ Proveedor actualizado exitosamente');
        return response.data;
      } else {
        ProveedoresLogger.warn('Error al actualizar proveedor', response.data);
        throw new Error(response.data?.message || 'Error al actualizar proveedor');
      }
    } catch (error) {
      ProveedoresLogger.error('Error actualizando proveedor:', {
        id,
        error: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // 🎯 ELIMINAR PROVEEDOR
  deleteProveedor: async (id) => {
    try {
      ProveedoresLogger.info(`Eliminando proveedor ID: ${id}`);
      const response = await api.delete(`/proveedores/delete`, { 
        data: { id } 
      });
      
      if (response.data?.success) {
        ProveedoresLogger.info('✅ Proveedor eliminado exitosamente');
        return response.data;
      } else {
        ProveedoresLogger.warn('Error al eliminar proveedor', response.data);
        throw new Error(response.data?.message || 'Error al eliminar proveedor');
      }
    } catch (error) {
      ProveedoresLogger.error('Error eliminando proveedor:', {
        id,
        error: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // 🎯 OBTENER UN PROVEEDOR POR ID
  getProveedorById: async (id) => {
    try {
      ProveedoresLogger.info(`Obteniendo proveedor por ID: ${id}`);
      const response = await api.get(`/proveedores/get/${id}`);
      
      if (response.data?.success) {
        ProveedoresLogger.debug('✅ Proveedor obtenido exitosamente');
        return response.data;
      } else {
        ProveedoresLogger.warn('Proveedor no encontrado', { id });
        throw new Error(response.data?.message || 'Proveedor no encontrado');
      }
    } catch (error) {
      ProveedoresLogger.error('Error obteniendo proveedor por ID:', {
        id,
        error: error.message
      });
      throw error;
    }
  },

  // 🎯 OBTENER PERSONAL DE UN PROVEEDOR
  getPersonalProveedor: async (proveedorId) => {
    try {
      ProveedoresLogger.info(`Obteniendo personal del proveedor ID: ${proveedorId}`);
      const response = await api.get(`/proveedores/proveedor_personal`, {
        params: { proveedor_id: proveedorId }
      });

      if (response.data) {
        ProveedoresLogger.debug('✅ Personal del proveedor obtenido exitosamente');
        return response.data;
      } else {
        ProveedoresLogger.warn('Error en respuesta');
        return { success: false, data: [] };
      }
    } catch (error) {
      ProveedoresLogger.error('Error obteniendo personal del proveedor:', {
        proveedorId,
        error: error.message
      });
      return { success: false, data: [] };
    }
  },

  // 🎯 OBTENER DOCUMENTOS DE UN PROVEEDOR
  getDocumentosProveedor: async (proveedorId) => {
    try {
      ProveedoresLogger.info(`Obteniendo documentos del proveedor ID: ${proveedorId}`);
      const response = await api.get(`/proveedores/documentos_proveedor`, {
        params: { proveedor_id: proveedorId }
      });

      if (response.data) {
        ProveedoresLogger.debug('✅ Documentos del proveedor obtenidos exitosamente');
        return response.data;
      } else {
        ProveedoresLogger.warn('Error en respuesta de documentos');
        return { success: false, data: [] };
      }
    } catch (error) {
      ProveedoresLogger.error('Error obteniendo documentos del proveedor:', {
        proveedorId,
        error: error.message
      });
      return { success: false, data: [] };
    }
  },

  // 🎯 CARGA MASIVA DE PROVEEDORES
  cargaMasivaProveedores: async (data) => {
    try {
      ProveedoresLogger.info('Ejecutando carga masiva de proveedores', { registros: data.length });
      
      const response = await api.post('/proveedores/carga_masiva_proveedores', data);
      
      if (response.data?.success) {
        ProveedoresLogger.info('✅ Carga masiva exitosa', response.data);
        return {
          success: true,
          message: response.data.message,
          resumen: response.data.resumen,
          detalle_errores: response.data.detalle_errores
        };
      } else {
        const errorMsg = response.data?.message || 'Error en carga masiva';
        ProveedoresLogger.warn('Error en carga masiva:', response.data);
        throw new Error(errorMsg);
      }
    } catch (error) {
      ProveedoresLogger.error('Error en carga masiva:', {
        error: error.message,
        status: error.response?.status
      });
      throw error;
    }
  }
};

export default proveedoresService;
export { ProveedoresLogger };