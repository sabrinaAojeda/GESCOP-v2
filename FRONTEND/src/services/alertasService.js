import api from './api';

const alertasService = {
  // Obtener alertas con filtros
  getAlertas: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filtros.categoria) params.append('categoria', filtros.categoria);
      if (filtros.nivel) params.append('nivel', filtros.nivel);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limit) params.append('limit', filtros.limit);
      
      const response = await api.get(`/alertas.php?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo alertas:', error);
      throw error;
    }
  },

  // Obtener estadísticas
  getEstadisticas: async () => {
    try {
      const response = await api.get('/alertas.php?estadisticas=1');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  // Obtener alertas para dashboard
  getAlertasDashboard: async () => {
    try {
      const response = await api.get('/alertas.php?dashboard=1');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo alertas dashboard:', error);
      throw error;
    }
  },

  // Crear alerta
  crearAlerta: async (alertaData) => {
    try {
      const response = await api.post('/alertas.php', alertaData);
      return response.data;
    } catch (error) {
      console.error('Error creando alerta:', error);
      throw error;
    }
  },

  // Resolver alerta
  resolverAlerta: async (id) => {
    try {
      const response = await api.put('/alertas.php', {
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
      const response = await api.put('/alertas.php', {
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
      const response = await api.post('/alertas.php', {
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
      const response = await api.get(`/parametros.php?categoria=${categoria}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo parámetros:', error);
      throw error;
    }
  }
};

export default alertasService;