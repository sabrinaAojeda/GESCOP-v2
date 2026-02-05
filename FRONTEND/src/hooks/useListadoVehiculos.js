// src/hooks/useListadoVehiculos.js - VERSIÓN CORREGIDA
import { useState, useEffect, useRef } from 'react';
import vehiculoService from '../services/vehiculoService';

// Logger específico para hooks
const HookLogger = {
  info: (hookName, message, data = null) => {
    console.info(`🎯 [${hookName}] ${message}`, data || '');
  },
  error: (hookName, message, data = null) => {
    console.error(`💥 [${hookName}] ${message}`, data || '');
  },
  debug: (hookName, message, data = null) => {
    console.log(`🔧 [${hookName}] ${message}`, data || '');
  }
};

export const useListadoVehiculos = () => {
  const HOOK_NAME = 'useListadoVehiculos';
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 50,
    total: 0,
    total_pages: 0
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    search: '',
    sector: '',
    estado: '',
    tipo: ''
  });

  const mountedRef = useRef(true);

  // Función para procesar la respuesta del backend - CORREGIDA
  const procesarRespuestaVehiculos = (response) => {
    HookLogger.debug(HOOK_NAME, 'Procesando respuesta del backend', response);
    
    // ✅ CORREGIDO: Formato que realmente usa el backend
    if (response.success !== undefined && response.data) {
      // Formato: { success: true, data: { vehiculos: [], pagination: {} } }
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
      return response.data.vehiculos || [];
    } else if (response.data && response.data.vehiculos) {
      // Formato alternativo: { data: { vehiculos: [] } }
      return response.data.vehiculos || [];
    } else if (Array.isArray(response)) {
      // Array directo
      return response;
    } else {
      HookLogger.warn(HOOK_NAME, 'Formato de respuesta inesperado', response);
      return [];
    }
  };

  // Cargar vehículos desde el backend
  const loadVehiculos = async (newFilters = {}) => {
    if (loading) {
      HookLogger.debug(HOOK_NAME, 'Load bloqueado - ya está cargando');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const updatedFilters = { ...filters, ...newFilters, limit: 50 };
      HookLogger.info(HOOK_NAME, 'Iniciando carga de vehículos', updatedFilters);
      
      const response = await vehiculoService.getVehiculos(updatedFilters);
      
      if (mountedRef.current) {
        // Procesar la respuesta de manera robusta
        const vehiculosAdaptados = procesarRespuestaVehiculos(response);
        
        HookLogger.info(HOOK_NAME, `Carga completada: ${vehiculosAdaptados.length} vehículos`);
        setVehiculos(vehiculosAdaptados);
        setFilters(updatedFilters);
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMsg = err.response?.data?.message || err.message || 'Error al cargar el listado de vehículos';
        
        HookLogger.error(HOOK_NAME, 'Error en carga', {
          error: err.message,
          userMessage: errorMsg,
          status: err.response?.status,
          url: err.config?.url
        });
        
        setError(`Error ${err.response?.status}: ${errorMsg}`);
        
        // NO usar datos mock - retornar array vacío en producción
        setVehiculos([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Crear vehículo
  const agregarVehiculo = async (vehiculoData) => {
    if (loading) {
      HookLogger.debug(HOOK_NAME, 'Creación bloqueada - operación en curso');
      return { success: false, error: 'Ya hay una operación en curso' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      HookLogger.info(HOOK_NAME, 'Creando nuevo vehículo', { interno: vehiculoData.interno });
      const resultado = await vehiculoService.createVehiculo(vehiculoData);
      
      if (resultado.success) {
        // Recargar después de crear
        HookLogger.debug(HOOK_NAME, 'Recargando lista después de creación');
        await loadVehiculos();
        
        HookLogger.info(HOOK_NAME, 'Vehículo creado exitosamente');
        return { success: true };
      } else {
        const errorMsg = resultado.message || 'Error al crear el vehículo';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al crear el vehículo';
      HookLogger.error(HOOK_NAME, 'Error al crear vehículo', {
        interno: vehiculoData.interno,
        error: err.message,
        status: err.response?.status
      });
      
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar vehículo
  const actualizarVehiculo = async (interno, vehiculoData) => {
    if (loading) {
      HookLogger.debug(HOOK_NAME, 'Actualización bloqueada - operación en curso');
      return { success: false, error: 'Ya hay una operación en curso' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      HookLogger.info(HOOK_NAME, 'Actualizando vehículo', { interno });
      const resultado = await vehiculoService.updateVehiculo(interno, vehiculoData);
      
      if (resultado.success) {
        // Recargar después de actualizar
        HookLogger.debug(HOOK_NAME, 'Recargando lista después de actualización');
        await loadVehiculos();
        
        HookLogger.info(HOOK_NAME, 'Vehículo actualizado exitosamente');
        return { success: true };
      } else {
        const errorMsg = resultado.message || 'Error al actualizar el vehículo';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar el vehículo';
      HookLogger.error(HOOK_NAME, 'Error al actualizar vehículo', {
        interno,
        error: err.message,
        status: err.response?.status
      });
      
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar vehículo
  const eliminarVehiculo = async (interno) => {
    if (loading) {
      HookLogger.debug(HOOK_NAME, 'Eliminación bloqueada - operación en curso');
      return { success: false, error: 'Ya hay una operación en curso' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      HookLogger.info(HOOK_NAME, 'Eliminando vehículo', { interno });
      const resultado = await vehiculoService.deleteVehiculo(interno);
      
      if (resultado.success) {
        // Recargar después de eliminar
        HookLogger.debug(HOOK_NAME, 'Recargando lista después de eliminación');
        await loadVehiculos();
        
        HookLogger.info(HOOK_NAME, 'Vehículo eliminado exitosamente');
        return { success: true };
      } else {
        const errorMsg = resultado.message || 'Error al eliminar el vehículo';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al eliminar el vehículo';
      HookLogger.error(HOOK_NAME, 'Error al eliminar vehículo', {
        interno,
        error: err.message,
        status: err.response?.status
      });
      
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Buscar vehículos
  const handleSearch = (searchTerm) => {
    if (!loading) {
      HookLogger.debug(HOOK_NAME, 'Aplicando filtro de búsqueda', { searchTerm });
      loadVehiculos({ search: searchTerm, page: 1 });
    }
  };

  // Filtrar por sector
  const handleSectorFilter = (sector) => {
    if (!loading) {
      HookLogger.debug(HOOK_NAME, 'Aplicando filtro de sector', { sector });
      loadVehiculos({ sector, page: 1 });
    }
  };

  // Filtrar por estado
  const handleEstadoFilter = (estado) => {
    if (!loading) {
      HookLogger.debug(HOOK_NAME, 'Aplicando filtro de estado', { estado });
      loadVehiculos({ estado, page: 1 });
    }
  };

  // Filtrar por tipo
  const handleTipoFilter = (tipo) => {
    if (!loading) {
      HookLogger.debug(HOOK_NAME, 'Aplicando filtro de tipo', { tipo });
      loadVehiculos({ tipo, page: 1 });
    }
  };

  // Cambiar página
  const handlePageChange = (newPage) => {
    if (!loading) {
      HookLogger.debug(HOOK_NAME, 'Cambiando página', { newPage });
      loadVehiculos({ page: newPage });
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    mountedRef.current = true;
    HookLogger.info(HOOK_NAME, 'Hook montado - iniciando carga inicial');
    loadVehiculos();

    return () => {
      mountedRef.current = false;
      HookLogger.debug(HOOK_NAME, 'Hook desmontado');
    };
  }, []);

  return {
    vehiculos: Array.isArray(vehiculos) ? vehiculos : [],
    loading,
    error,
    pagination,
    filters,
    agregarVehiculo,
    actualizarVehiculo,
    eliminarVehiculo,
    handleSearch,
    handleSectorFilter,
    handleEstadoFilter,
    handleTipoFilter,
    handlePageChange,
    loadVehiculos
  };
};
