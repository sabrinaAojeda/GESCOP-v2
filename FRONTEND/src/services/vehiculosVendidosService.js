// FRONTEND/src/services/vehiculosVendidosService.js - SERVICIO COMPLETO
import api from './api';

const vehiculosVendidosService = {
  // Obtener vehículos vendidos
  getVehiculosVendidos: async (filters = {}) => {
    try {
      console.log('💰 [VENDIDOS_SERVICE] Obteniendo vehículos vendidos:', filters);
      const response = await api.get('/flota/vehiculos_vendidos', { params: filters });
      
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Error al obtener vehículos vendidos');
      }
      
      console.log('✅ [VENDIDOS_SERVICE] Vehículos vendidos obtenidos:', response.data.data?.vehiculos_vendidos?.length || 0);
      return response.data;
      
    } catch (error) {
      console.error('❌ [VENDIDOS_SERVICE] Error:', error);
      throw error;
    }
  },
  
  // Crear vehículo vendido
  createVehiculoVendido: async (vehiculoData) => {
    try {
      console.log('💰 [VENDIDOS_SERVICE] Creando vehículo vendido:', vehiculoData);
      const response = await api.post('/flota/vehiculos_vendidos', vehiculoData);
      
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Error al crear vehículo vendido');
      }
      
      console.log('✅ [VENDIDOS_SERVICE] Vehículo vendido creado exitosamente');
      return response.data;
      
    } catch (error) {
      console.error('❌ [VENDIDOS_SERVICE] Error creando:', error);
      throw error;
    }
  },
  
  // Actualizar vehículo vendido
  updateVehiculoVendido: async (id, vehiculoData) => {
    try {
      console.log('💰 [VENDIDOS_SERVICE] Actualizando vehículo vendido:', { id, ...vehiculoData });
      const response = await api.put('/flota/vehiculos_vendidos', { id, ...vehiculoData });
      
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Error al actualizar vehículo vendido');
      }
      
      console.log('✅ [VENDIDOS_SERVICE] Vehículo vendido actualizado exitosamente');
      return response.data;
      
    } catch (error) {
      console.error('❌ [VENDIDOS_SERVICE] Error actualizando:', error);
      throw error;
    }
  },
  
  // Eliminar vehículo vendido
  deleteVehiculoVendido: async (id) => {
    try {
      console.log('💰 [VENDIDOS_SERVICE] Eliminando vehículo vendido:', id);
      const response = await api.delete('/flota/vehiculos_vendidos', { 
        data: { id } 
      });
      
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Error al eliminar vehículo vendido');
      }
      
      console.log('✅ [VENDIDOS_SERVICE] Vehículo vendido eliminado exitosamente');
      return response.data;
      
    } catch (error) {
      console.error('❌ [VENDIDOS_SERVICE] Error eliminando:', error);
      throw error;
    }
  }
};

export default vehiculosVendidosService;