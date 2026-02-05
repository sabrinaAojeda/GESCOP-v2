// src/hooks/useFlota.js - HOOK UNIFICADO PARA TODOS LOS MÓDULOS DE FLOTA
import { useState, useEffect, useRef, useCallback } from 'react';
import vehiculoService from '../services/vehiculoService';
import equipamientoService from '../services/equipamientoService';
import vehiculosVendidosService from '../services/vehiculosVendidosService';

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

export const useFlota = (module = 'vehiculos') => {
  const HOOK_NAME = `useFlota-${module}`;
  const [data, setData] = useState([]);
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

  // Seleccionar el servicio según el módulo
  const getService = () => {
    switch(module) {
      case 'vehiculos':
        return vehiculoService;
      case 'equipamientos':
        return equipamientosService;
      case 'vendidos':
        return vehiculosVendidosService;
      default:
        return vehiculoService;
    }
  };

  // Procesar respuesta del backend
  const procesarRespuesta = useCallback((response) => {
    HookLogger.debug(HOOK_NAME, 'Procesando respuesta', response);
    
    // Formato: { success: true, data: { vehiculos: [], pagination: {} } }
    if (response.success !== undefined && response.data) {
      const key = module === 'vehiculos' ? 'vehiculos' : 
                 module === 'equipamientos' ? 'equipamientos' : 
                 'vehiculos_vendidos';
      
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
      return response.data[key] || [];
    } 
    // Formato alternativo
    else if (response.data && response.data[module]) {
      return response.data[module] || [];
    } 
    // Array directo
    else if (Array.isArray(response)) {
      return response;
    } else {
      HookLogger.warn(HOOK_NAME, 'Formato de respuesta inesperado', response);
      return [];
    }
  }, [module]);

  // Cargar datos
  const loadData = async (newFilters = {}) => {
    if (loading) {
      HookLogger.debug(HOOK_NAME, 'Load bloqueado - ya está cargando');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const service = getService();
      const updatedFilters = { ...filters, ...newFilters, limit: 50 };
      
      HookLogger.info(HOOK_NAME, 'Iniciando carga', updatedFilters);
      
      let response;
      switch(module) {
        case 'vehiculos':
          response = await service.getVehiculos(updatedFilters);
          break;
        case 'equipamientos':
          response = await service.getEquipamientos(updatedFilters);
          break;
        case 'vendidos':
          response = await service.getVehiculosVendidos(updatedFilters);
          break;
        default:
          response = await service.getVehiculos(updatedFilters);
      }
      
      if (mountedRef.current) {
        const datosProcesados = procesarRespuesta(response);
        
        HookLogger.info(HOOK_NAME, `Carga completada: ${datosProcesados.length} registros`);
        setData(datosProcesados);
        setFilters(updatedFilters);
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMsg = err.response?.data?.message || err.message || `Error al cargar datos de ${module}`;
        
        HookLogger.error(HOOK_NAME, 'Error en carga', {
          error: err.message,
          userMessage: errorMsg,
          status: err.response?.status
        });
        
        setError(errorMsg);
        setData([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  // CRUD operations
  const crearItem = async (itemData) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };
    
    setLoading(true);
    setError(null);
    
    try {
      const service = getService();
      HookLogger.info(HOOK_NAME, 'Creando nuevo item', itemData);
      
      let resultado;
      switch(module) {
        case 'vehiculos':
          resultado = await service.createVehiculo(itemData);
          break;
        case 'equipamientos':
          resultado = await service.createEquipamiento(itemData);
          break;
        case 'vendidos':
          resultado = await service.createVehiculoVendido(itemData);
          break;
      }
      
      if (resultado.success) {
        await loadData();
        return { success: true };
      } else {
        const errorMsg = resultado.message || `Error al crear ${module}`;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || `Error al crear ${module}`;
      HookLogger.error(HOOK_NAME, `Error al crear ${module}`, err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const actualizarItem = async (id, itemData) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };
    
    setLoading(true);
    setError(null);
    
    try {
      const service = getService();
      HookLogger.info(HOOK_NAME, 'Actualizando item', { id, ...itemData });
      
      let resultado;
      switch(module) {
        case 'vehiculos':
          resultado = await service.updateVehiculo(id, itemData);
          break;
        case 'equipamientos':
          resultado = await service.updateEquipamiento(id, itemData);
          break;
        case 'vendidos':
          resultado = await service.updateVehiculoVendido(id, itemData);
          break;
      }
      
      if (resultado.success) {
        await loadData();
        return { success: true };
      } else {
        const errorMsg = resultado.message || `Error al actualizar ${module}`;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || `Error al actualizar ${module}`;
      HookLogger.error(HOOK_NAME, `Error al actualizar ${module}`, err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const eliminarItem = async (id) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };
    
    setLoading(true);
    setError(null);
    
    try {
      const service = getService();
      HookLogger.info(HOOK_NAME, 'Eliminando item', { id });
      
      let resultado;
      switch(module) {
        case 'vehiculos':
          resultado = await service.deleteVehiculo(id);
          break;
        case 'equipamientos':
          resultado = await service.deleteEquipamiento(id);
          break;
        case 'vendidos':
          resultado = await service.deleteVehiculoVendido(id);
          break;
      }
      
      if (resultado.success) {
        await loadData();
        return { success: true };
      } else {
        const errorMsg = resultado.message || `Error al eliminar ${module}`;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || `Error al eliminar ${module}`;
      HookLogger.error(HOOK_NAME, `Error al eliminar ${module}`, err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Handlers de filtros
  const handleSearch = (searchTerm) => {
    if (!loading) {
      loadData({ search: searchTerm, page: 1 });
    }
  };

  const handleSectorFilter = (sector) => {
    if (!loading) {
      loadData({ sector, page: 1 });
    }
  };

  const handleEstadoFilter = (estado) => {
    if (!loading) {
      loadData({ estado, page: 1 });
    }
  };

  const handleTipoFilter = (tipo) => {
    if (!loading) {
      loadData({ tipo, page: 1 });
    }
  };

  const handlePageChange = (newPage) => {
    if (!loading) {
      loadData({ page: newPage });
    }
  };

  // Carga inicial
  useEffect(() => {
    mountedRef.current = true;
    HookLogger.info(HOOK_NAME, 'Hook montado - iniciando carga inicial');
    loadData();

    return () => {
      mountedRef.current = false;
      HookLogger.debug(HOOK_NAME, 'Hook desmontado');
    };
  }, []);

  return {
    // Datos
    data: Array.isArray(data) ? data : [],
    loading,
    error,
    pagination,
    filters,
    
    // CRUD
    crearItem,
    actualizarItem,
    eliminarItem,
    
    // Filtros
    handleSearch,
    handleSectorFilter,
    handleEstadoFilter,
    handleTipoFilter,
    handlePageChange,
    loadData,
    
    // Utilidades
    hasData: Array.isArray(data) && data.length > 0
  };
};

export default useFlota;