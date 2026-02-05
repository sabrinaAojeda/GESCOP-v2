import api from './api';

const alertasService = {
  // Obtener alertas con filtros
  getAlertas: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Normalizar filtros del frontend al backend
      if (filtros.categoria) params.append('categoria', filtros.categoria);
      
      // Convertir nivel/prioridad
      if (filtros.nivel || filtros.prioridad) {
        const nivel = filtros.nivel || filtros.prioridad;
        const nivelMap = {
          'Crítico': 'critico', 'critico': 'critico',
          'Alto': 'alto', 'alto': 'alto',
          'Medio': 'medio', 'medio': 'medio',
          'Bajo': 'bajo', 'bajo': 'bajo'
        };
        params.append('prioridad', nivelMap[nivel] || nivel);
      }
      
      // Convertir estado
      if (filtros.estado) {
        const estadoMap = {
          'Pendiente': 'activa', 'pendiente': 'activa',
          'En proceso': 'en_proceso', 'en proceso': 'en_proceso',
          'Resuelto': 'resuelta', 'resuelta': 'resuelta'
        };
        params.append('estado', estadoMap[filtros.estado] || filtros.estado);
      }
      
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.search) params.append('search', filtros.search);
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limit) params.append('limit', filtros.limit);
      
      const response = await api.get(`/herramientas/alertas?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo alertas:', error);
      throw error;
    }
  },

  // Obtener estadísticas
  getEstadisticas: async () => {
    try {
      const response = await api.get('/herramientas/alertas?estadisticas=1');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  // Obtener alertas para dashboard
  getAlertasDashboard: async () => {
    try {
      const response = await api.get('/herramientas/alertas?dashboard=1');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo alertas dashboard:', error);
      throw error;
    }
  },

  // Crear alerta
  crearAlerta: async (alertaData) => {
    try {
      const response = await api.post('/herramientas/alertas', alertaData);
      return response.data;
    } catch (error) {
      console.error('Error creando alerta:', error);
      throw error;
    }
  },

  // Resolver alerta
  resolverAlerta: async (id) => {
    try {
      const response = await api.put('/herramientas/alertas?accion=resolver', {
        id,
        accion: 'resolver'
      });
      return response.data;
    } catch (error) {
      console.error('Error resolviendo alerta:', error);
      throw error;
    }
  },

  // Posponer alerta
  posponerAlerta: async (id) => {
    try {
      const response = await api.put('/herramientas/alertas?accion=posponer', {
        id,
        accion: 'posponer'
      });
      return response.data;
    } catch (error) {
      console.error('Error posponiendo alerta:', error);
      throw error;
    }
  },

  // Generar alertas automáticas
  generarAlertasAutomaticas: async () => {
    try {
      const response = await api.post('/herramientas/alertas?generar_automaticas=1', {
        accion: 'generar_automaticas'
      });
      return response.data;
    } catch (error) {
      console.error('Error generando alertas automáticas:', error);
      throw error;
    }
  },

  // Obtener parámetros (para sectores, tipos de seguro, etc.)
  getParametros: async (categoria) => {
    try {
      const response = await api.get(`/parametros?categoria=${categoria}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo parámetros:', error);
      throw error;
    }
  }
};

export default alertasService;