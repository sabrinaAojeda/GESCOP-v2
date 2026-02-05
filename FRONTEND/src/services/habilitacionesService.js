// src/services/habilitacionesService.js
import api from './api';

const habilitacionesService = {
  // Obtener todas las habilitaciones
  getHabilitaciones: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Agregar todos los filtros posibles
      if (filters.entidad_tipo) params.append('entidad_tipo', filters.entidad_tipo);
      if (filters.entidad_id) params.append('entidad_id', filters.entidad_id);
      if (filters.proximas) params.append('proximas', 'true');
      if (filters.dias) params.append('dias', filters.dias);
      if (filters.tipo) params.append('tipo', filters.tipo);
      // Puedes agregar más filtros aquí según necesites
      
      const response = await api.get(`/empresas/habilitaciones?${params.toString()}`);
      return {
        success: true,
        data: response.data.data || [],
        filters: response.data.filters || {}
      };
    } catch (error) {
      console.error('Error al obtener habilitaciones:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  },

  // Crear nueva habilitación
  createHabilitacion: async (habilitacionData) => {
    try {
      const response = await api.post('/empresas/habilitaciones', habilitacionData);
      return {
        success: true,
        data: response.data,
        message: 'Habilitación creada exitosamente'
      };
    } catch (error) {
      console.error('Error al crear habilitación:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  // Actualizar habilitación
  updateHabilitacion: async (id, habilitacionData) => {
    try {
      const response = await api.put('/empresas/habilitaciones', {
        id,
        ...habilitacionData
      });
      return {
        success: true,
        data: response.data,
        message: 'Habilitación actualizada exitosamente'
      };
    } catch (error) {
      console.error('Error al actualizar habilitación:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  // Eliminar habilitación
  deleteHabilitacion: async (id) => {
    try {
      const response = await api.delete('/empresas/habilitaciones', {
        data: { id }
      });
      return {
        success: true,
        data: response.data,
        message: 'Habilitación eliminada exitosamente'
      };
    } catch (error) {
      console.error('Error al eliminar habilitación:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  // Obtener habilitaciones próximas a vencer
  getProximasAVencer: async (dias = 30) => {
    try {
      const response = await api.get(`/empresas/habilitaciones?proximas=true&dias=${dias}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Error al obtener habilitaciones próximas:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }
};

export default habilitacionesService;