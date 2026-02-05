// FRONTEND/src/services/equipamientoService.js - SERVICIO COMPLETO
import api from './api';

const equipamientoService = {
  // Obtener equipamientos
  getEquipamientos: async (filters = {}) => {
    try {
      console.log('🔧 [EQUIPAMIENTO_SERVICE] Obteniendo equipamientos:', filters);
      const response = await api.get('/flota/equipamientos', { params: filters });
      
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Error al obtener equipamientos');
      }
      
      console.log('✅ [EQUIPAMIENTO_SERVICE] Equipamientos obtenidos:', response.data.data?.equipamientos?.length || 0);
      return response.data;
      
    } catch (error) {
      console.error('❌ [EQUIPAMIENTO_SERVICE] Error:', error);
      throw error;
    }
  },
  
  // Crear equipamiento
  createEquipamiento: async (equipamientoData) => {
    try {
      console.log('🔧 [EQUIPAMIENTO_SERVICE] Creando equipamiento:', equipamientoData);
      const response = await api.post('/flota/equipamientos', equipamientoData);
      
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Error al crear equipamiento');
      }
      
      console.log('✅ [EQUIPAMIENTO_SERVICE] Equipamiento creado exitosamente');
      return response.data;
      
    } catch (error) {
      console.error('❌ [EQUIPAMIENTO_SERVICE] Error creando:', error);
      throw error;
    }
  },
  
  // Actualizar equipamiento
  updateEquipamiento: async (id, equipamientoData) => {
    try {
      console.log('🔧 [EQUIPAMIENTO_SERVICE] Actualizando equipamiento:', { id, ...equipamientoData });
      const response = await api.put('/flota/equipamientos', { id, ...equipamientoData });
      
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Error al actualizar equipamiento');
      }
      
      console.log('✅ [EQUIPAMIENTO_SERVICE] Equipamiento actualizado exitosamente');
      return response.data;
      
    } catch (error) {
      console.error('❌ [EQUIPAMIENTO_SERVICE] Error actualizando:', error);
      throw error;
    }
  },
  
  // Eliminar equipamiento
  deleteEquipamiento: async (id) => {
    try {
      console.log('🔧 [EQUIPAMIENTO_SERVICE] Eliminando equipamiento:', id);
      const response = await api.delete('/flota/equipamientos', { 
        data: { id } 
      });
      
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Error al eliminar equipamiento');
      }
      
      console.log('✅ [EQUIPAMIENTO_SERVICE] Equipamiento eliminado exitosamente');
      return response.data;
      
    } catch (error) {
      console.error('❌ [EQUIPAMIENTO_SERVICE] Error eliminando:', error);
      throw error;
    }
  },
  
  // 🎯 CARGA MASIVA DE EQUIPAMIENTOS
  cargaMasivaEquipamientos: async (data) => {
    try {
      console.log('🔧 [EQUIPAMIENTO_SERVICE] Ejecutando carga masiva', { registros: data.length });
      
      const response = await api.post('/flota/carga_masiva_equipamientos', data);
      
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
      console.error('❌ [EQUIPAMIENTO_SERVICE] Error en carga masiva:', error);
      throw error;
    }
  }
};

export default equipamientoService;