// FRONTEND/src/services/reportesService.js - SERVICIO DE REPORTES
import api from './api';

const reportesService = {
  // Obtener lista de reportes
  getReportes: async (filters = {}) => {
    try {
      console.log('📊 [ReportesService] Obteniendo reportes:', filters);
      
      const params = new URLSearchParams();
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/herramientas/reportes?${params.toString()}`);
      
      console.log('✅ [ReportesService] Respuesta:', response.data);
      
      if (response.data && response.data.success !== false) {
        return {
          success: true,
          data: response.data.reportes || response.data.data || [],
          pagination: response.data.pagination
        };
      } else {
        return {
          success: false,
          data: [],
          error: response.data?.message || 'Error al obtener reportes'
        };
      }
    } catch (error) {
      console.error('❌ [ReportesService] Error:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  // Generar nuevo reporte
  generarReporte: async (reporteData) => {
    try {
      console.log('📊 [ReportesService] Generando reporte:', reporteData);
      
      const response = await api.post('/herramientas/reportes', reporteData);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Reporte generado exitosamente'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Error al generar reporte'
        };
      }
    } catch (error) {
      console.error('❌ [ReportesService] Error generando reporte:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Eliminar reporte
  eliminarReporte: async (id) => {
    try {
      console.log('📊 [ReportesService] Eliminando reporte:', id);
      
      const response = await api.delete('/herramientas/reportes', {
        data: { id }
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Reporte eliminado exitosamente'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Error al eliminar reporte'
        };
      }
    } catch (error) {
      console.error('❌ [ReportesService] Error eliminando reporte:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Descargar reporte
  descargarReporte: async (id) => {
    try {
      console.log('📊 [ReportesService] Descargando reporte:', id);
      
      const response = await api.get(`/herramientas/reportes/${id}`, {
        responseType: 'blob'
      });
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      console.error('❌ [ReportesService] Error descargando reporte:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Obtener estadísticas de reportes
  getEstadisticas: async () => {
    try {
      console.log('📊 [ReportesService] Obteniendo estadísticas...');
      
      const response = await api.get('/herramientas/reportes?estadisticas=1');
      
      return {
        success: true,
        data: response.data || {}
      };
    } catch (error) {
      console.error('❌ [ReportesService] Error obteniendo estadísticas:', error);
      return {
        success: false,
        data: {
          mensuales: 0,
          trimestrales: 0,
          anuales: 0
        }
      };
    }
  }
};

export default reportesService;
