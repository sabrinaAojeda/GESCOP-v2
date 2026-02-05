import api from './api';

const documentosService = {
  // Obtener documentos de una entidad
  getDocumentos: async (entidad_tipo, entidad_id, filters = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('entidad_tipo', entidad_tipo);
      params.append('entidad_id', entidad_id);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/documentos?${params.toString()}`);
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Subir documento
  uploadDocumento: async (entidad_tipo, entidad_id, file, descripcion = '') => {
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('entidad_tipo', entidad_tipo);
      formData.append('entidad_id', entidad_id);
      formData.append('descripcion', descripcion);
      
      const response = await api.post('/documentos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al subir documento:', error);
      return { success: false, error: error.message };
    }
  },

  // Eliminar documento
  deleteDocumento: async (id) => {
    try {
      const response = await api.delete(`/documentos/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      return { success: false, error: error.message };
    }
  }
};

export default documentosService;