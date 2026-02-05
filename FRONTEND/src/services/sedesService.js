// FRONTEND/src/services/sedesService.js - RUTAS CORREGIDAS
import api from './api';

const sedesService = {
  // Obtener todas las sedes - RUTA CORREGIDA
  getSedes: async (params = {}) => {
    try {
      console.log('📥 [SedesService] Obteniendo sedes con params:', params);
      
      const response = await api.get('/empresas/sedes', { params });
      
      console.log('📤 [SedesService] Respuesta:', response.data);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          filters: response.data.filters || {},
          pagination: response.data.pagination || {
            current_page: 1,
            per_page: 10,
            total: 0,
            total_pages: 1
          }
        };
      } else {
        return {
          success: false,
          data: [],
          error: response.data?.error || 'Error en la respuesta del servidor',
          message: response.data?.message || 'No se pudieron obtener las sedes'
        };
      }
    } catch (error) {
      console.error('❌ [SedesService] Error:', error);
      return {
        success: false,
        data: [],
        error: error.message,
        message: error.response?.message || 'Error al conectar con el servidor'
      };
    }
  },

  // Obtener una sede específica - RUTA CORREGIDA
  getSede: async (id) => {
    try {
      console.log(`📥 [SedesService] Obteniendo sede ID: ${id}`);
      
      const response = await api.get(`/empresas/sedes/${id}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Sede obtenida exitosamente'
        };
      } else {
        return {
          success: false,
          data: null,
          error: response.data?.error || 'Sede no encontrada',
          message: response.data?.message || 'Error al obtener sede'
        };
      }
    } catch (error) {
      console.error(`❌ [SedesService] Error obteniendo sede ${id}:`, error);
      return {
        success: false,
        data: null,
        error: error.message,
        message: 'Error de conexión al obtener sede'
      };
    }
  },

  // Crear nueva sede - RUTA CORREGIDA
  createSede: async (sedeData) => {
    try {
      console.log('📥 [SedesService] Creando sede:', sedeData);
      
      const response = await api.post('/empresas/sedes', sedeData);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Sede creada exitosamente'
        };
      } else {
        return {
          success: false,
          data: null,
          error: response.data?.error || 'Error al crear sede',
          message: response.data?.message || 'No se pudo crear la sede'
        };
      }
    } catch (error) {
      console.error('❌ [SedesService] Error creando sede:', error);
      return {
        success: false,
        data: null,
        error: error.message,
        message: error.response?.message || 'Error de conexión al crear sede'
      };
    }
  },

  // Actualizar sede - RUTA CORREGIDA
  updateSede: async (id, sedeData) => {
    try {
      console.log(`📥 [SedesService] Actualizando sede ${id}:`, sedeData);
      
      // Enviar ID en el body para PUT
      const dataToSend = { id, ...sedeData };
      const response = await api.put('/empresas/sedes', dataToSend);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Sede actualizada exitosamente'
        };
      } else {
        return {
          success: false,
          data: null,
          error: response.data?.error || 'Error al actualizar sede',
          message: response.data?.message || 'No se pudo actualizar la sede'
        };
      }
    } catch (error) {
      console.error(`❌ [SedesService] Error actualizando sede ${id}:`, error);
      return {
        success: false,
        data: null,
        error: error.message,
        message: error.response?.message || 'Error de conexión al actualizar sede'
      };
    }
  },

  // Eliminar sede - RUTA CORREGIDA
  deleteSede: async (id) => {
    try {
      console.log(`📥 [SedesService] Eliminando sede ID: ${id}`);
      
      // Include ID in URL like: /api/empresas/sedes/{id}
      const response = await api.delete(`/empresas/sedes/${id}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Sede eliminada exitosamente'
        };
      } else {
        return {
          success: false,
          data: null,
          error: response.data?.error || 'Error al eliminar sede',
          message: response.data?.message || 'No se pudo eliminar la sede'
        };
      }
    } catch (error) {
      console.error(`❌ [SedesService] Error eliminando sede ${id}:`, error);
      return {
        success: false,
        data: null,
        error: error.message,
        message: error.response?.message || 'Error de conexión al eliminar sede'
      };
    }
  },

  // Obtener habilitaciones de una sede - NUEVO ENDPOINT
  getHabilitacionesSede: async (sedeId) => {
    try {
      console.log(`📥 [SedesService] Obteniendo habilitaciones de sede ${sedeId}`);
      
      const response = await api.get(`/empresas/habilitaciones`, {
        params: {
          entidad_tipo: 'sede',
          entidad_id: sedeId
        }
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          count: response.data.count || 0
        };
      } else {
        return {
          success: false,
          data: [],
          error: response.data?.error || 'Error al obtener habilitaciones'
        };
      }
    } catch (error) {
      console.error(`❌ [SedesService] Error obteniendo habilitaciones:`, error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  // Obtener documentos de una sede - NUEVO ENDPOINT
  getDocumentosSede: async (sedeId) => {
    try {
      console.log(`📥 [SedesService] Obteniendo documentos de sede ${sedeId}`);
      
      const response = await api.get(`/documentos`, {
        params: {
          entidad_tipo: 'sede',
          entidad_id: sedeId
        }
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          count: response.data.count || 0
        };
      } else {
        return {
          success: false,
          data: [],
          error: response.data?.error || 'Error al obtener documentos'
        };
      }
    } catch (error) {
      console.error(`❌ [SedesService] Error obteniendo documentos:`, error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  // Obtener bases operativas de una sede - NUEVO ENDPOINT
  getBasesOperativasSede: async (sedeId) => {
    try {
      console.log(`📥 [SedesService] Obteniendo bases operativas de sede ${sedeId}`);
      
      const response = await api.get(`/empresas/bases_operativas`, {
        params: {
          sede_id: sedeId
        }
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          count: response.data.count || 0
        };
      } else {
        return {
          success: false,
          data: [],
          error: response.data?.error || 'Error al obtener bases operativas'
        };
      }
    } catch (error) {
      console.error(`❌ [SedesService] Error obteniendo bases operativas:`, error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  // Obtener estadísticas - FUNCIÓN MEJORADA
  getEstadisticas: async () => {
    try {
      console.log('📥 [SedesService] Calculando estadísticas');
      
      // Primero obtener todas las sedes
      const sedesResponse = await sedesService.getSedes();
      
      if (!sedesResponse.success) {
        return {
          success: false,
          data: {},
          error: 'No se pudieron obtener sedes para calcular estadísticas'
        };
      }
      
      const sedes = sedesResponse.data || [];
      
      // Calcular estadísticas
      const totalSedes = sedes.length;
      const totalVehiculos = sedes.reduce((sum, sede) => 
        sum + (parseInt(sede.vehiculos_asignados) || 0), 0);
      
      const habilitacionesPorVencer = sedes.filter(s => {
        if (!s.vencimiento_habilitacion) return false;
        try {
          const vencimiento = new Date(s.vencimiento_habilitacion);
          const hoy = new Date();
          const diferenciaDias = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
          return diferenciaDias > 0 && diferenciaDias <= 60;
        } catch (e) {
          return false;
        }
      }).length;
      
      return {
        success: true,
        data: {
          totalSedes,
          totalVehiculos,
          habilitacionesPorVencer,
          sedesActivas: sedes.filter(s => s.estado === 'Activa').length
        }
      };
    } catch (error) {
      console.error('❌ [SedesService] Error calculando estadísticas:', error);
      return {
        success: false,
        data: {},
        error: error.message
      };
    }
  },

  // 🎯 CARGA MASIVA DE SEDES
  cargaMasivaSedes: async (data) => {
    try {
      console.log('📥 [SedesService] Ejecutando carga masiva de sedes', { registros: data.length });
      
      const response = await api.post('/empresas/carga_masiva_sedes', data);
      
      if (response.data?.success) {
        console.log('✅ Carga masiva exitosa', response.data);
        return {
          success: true,
          message: response.data.message,
          resumen: response.data.resumen,
          detalle_errores: response.data.detalle_errores
        };
      } else {
        const errorMsg = response.data?.message || 'Error en carga masiva';
        console.warn('Error en carga masiva:', response.data);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ [SedesService] Error en carga masiva:', error);
      throw error;
    }
  }
};

export default sedesService;