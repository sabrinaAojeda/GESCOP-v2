// src/hooks/useVehiculos.js - VERSIÓN DEFINITIVA
import { useState, useEffect, useRef, useCallback } from 'react';
import { vehiculoService } from '../services/vehiculoService';

// 🎯 DATOS MOCK COMO FALLBACK
const getMockVehiculos = () => [
  {
    interno: "001",
    año: 2023,
    dominio: "AB-123-CD",
    modelo: "Toyota Hilux SRV",
    eq_incorporado: "GPS, Radio",
    sector: "Logística",
    chofer: "Juan Pérez",
    estado: "Activo",
    observaciones: "Nuevo ingreso",
    vtv_vencimiento: "2024-06-15",
    vtv_estado: "Vigente",
    hab_vencimiento: "2024-12-20",
    hab_estado: "Vigente",
    seguro_vencimiento: "2024-05-30",
    tipo: "Rodado"
  },
  {
    interno: "002",
    año: 2022,
    dominio: "EF-456-GH",
    modelo: "Ford Ranger",
    eq_incorporado: "Winche",
    sector: "Obras",
    chofer: "Carlos Gómez",
    estado: "Mantenimiento",
    observaciones: "Cambio de aceite pendiente",
    vtv_vencimiento: "2024-03-10",
    vtv_estado: "Vencido",
    hab_vencimiento: "2024-08-15",
    hab_estado: "Vigente",
    seguro_vencimiento: "2024-07-20",
    tipo: "Rodado"
  }
];

export const useVehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    sector: '',
    estado: '',
    tipo: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const mountedRef = useRef(true);

  // 🎯 FUNCIÓN PARA PROCESAR RESPUESTA DEL BACKEND
  const procesarRespuestaVehiculos = useCallback((response) => {
    console.log('🔍 Procesando respuesta del backend:', response);
    
    // 🎯 FORMATO 1: { success: true, data: { vehiculos: [], pagination: {} } }
    if (response.success && response.data) {
      return {
        vehiculos: response.data.vehiculos || [],
        pagination: response.data.pagination || {
          page: filters.page,
          limit: filters.limit,
          total: response.data.vehiculos?.length || 0,
          totalPages: Math.ceil((response.data.vehiculos?.length || 0) / filters.limit)
        }
      };
    }
    
    // 🎯 FORMATO 2: { vehiculos: [], pagination: {} }
    if (response.vehiculos && Array.isArray(response.vehiculos)) {
      return {
        vehiculos: response.vehiculos,
        pagination: response.pagination || {
          page: filters.page,
          limit: filters.limit,
          total: response.vehiculos.length,
          totalPages: Math.ceil(response.vehiculos.length / filters.limit)
        }
      };
    }
    
    // 🎯 FORMATO 3: Array directo
    if (Array.isArray(response)) {
      return {
        vehiculos: response,
        pagination: {
          page: 1,
          limit: response.length,
          total: response.length,
          totalPages: 1
        }
      };
    }
    
    // 🎯 FORMATO 4: Respuesta inesperada
    console.warn('⚠️ Formato de respuesta inesperado, usando fallback:', response);
    return {
      vehiculos: [],
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: 0,
        totalPages: 0
      }
    };
  }, [filters.page, filters.limit]);

  // 🎯 CARGAR VEHÍCULOS DESDE EL BACKEND
  const loadVehiculos = useCallback(async (newFilters = {}) => {
    if (loading || !mountedRef.current) return;

    setLoading(true);
    setError(null);
    
    try {
      const updatedFilters = { ...filters, ...newFilters, page: newFilters.page || filters.page };
      console.log('📤 Cargando vehículos con filtros:', updatedFilters);
      
      const response = await vehiculoService.getVehiculos(updatedFilters);
      
      if (mountedRef.current) {
        const { vehiculos: vehiculosAdaptados, pagination: paginationData } = procesarRespuestaVehiculos(response);
        
        console.log('✅ Vehículos cargados exitosamente:', vehiculosAdaptados.length);
        setVehiculos(vehiculosAdaptados);
        setPagination(paginationData);
        setFilters(updatedFilters);
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMsg = err.response?.data?.message || err.message || 'Error al cargar los vehículos';
        setError(errorMsg);
        console.error('❌ Error loading vehiculos:', err);
        
        // 🎯 FALLBACK A DATOS MOCK SOLO EN DESARROLLO
        if (import.meta.env.DEV) {
          console.log('🔄 Usando datos mock como fallback');
          const mockData = getMockVehiculos();
          setVehiculos(mockData);
          setPagination({
            page: 1,
            limit: 10,
            total: mockData.length,
            totalPages: 1
          });
        } else {
          setVehiculos([]);
          setPagination({
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          });
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [filters, loading, procesarRespuestaVehiculos]);

  // 🎯 CREAR VEHÍCULO
  const createVehiculo = async (vehiculoData) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };
    
    setLoading(true);
    setError(null);
    
    try {
      await vehiculoService.createVehiculo(vehiculoData);
      // 🎯 RECARGAR DESPUÉS DE CREAR
      await loadVehiculos({ page: 1 });
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al crear el vehículo';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // 🎯 ACTUALIZAR VEHÍCULO
  const updateVehiculo = async (interno, vehiculoData) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };
    
    setLoading(true);
    setError(null);
    
    try {
      await vehiculoService.updateVehiculo(interno, vehiculoData);
      // 🎯 RECARGAR DESPUÉS DE ACTUALIZAR
      await loadVehiculos({ page: filters.page });
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar el vehículo';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // 🎯 ELIMINAR VEHÍCULO
  const deleteVehiculo = async (interno) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };
    
    setLoading(true);
    setError(null);
    
    try {
      await vehiculoService.deleteVehiculo(interno);
      // 🎯 RECARGAR DESPUÉS DE ELIMINAR
      await loadVehiculos({ page: filters.page });
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al eliminar el vehículo';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // 🎯 MANEJADORES DE FILTROS
  const handlePageChange = (newPage) => {
    if (!loading && mountedRef.current) {
      loadVehiculos({ page: newPage });
    }
  };

  const handleSearch = (searchTerm) => {
    if (!loading && mountedRef.current) {
      loadVehiculos({ search: searchTerm, page: 1 });
    }
  };

  const handleSectorFilter = (sector) => {
    if (!loading && mountedRef.current) {
      loadVehiculos({ sector, page: 1 });
    }
  };

  const handleEstadoFilter = (estado) => {
    if (!loading && mountedRef.current) {
      loadVehiculos({ estado, page: 1 });
    }
  };

  const handleTipoFilter = (tipo) => {
    if (!loading && mountedRef.current) {
      loadVehiculos({ tipo, page: 1 });
    }
  };

  // 🎯 RESETEAR FILTROS
  const resetFilters = () => {
    if (!loading && mountedRef.current) {
      const defaultFilters = {
        page: 1,
        limit: 10,
        search: '',
        sector: '',
        estado: '',
        tipo: ''
      };
      loadVehiculos(defaultFilters);
    }
  };

  // 🎯 CARGA INICIAL
  useEffect(() => {
    mountedRef.current = true;
    loadVehiculos();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 🎯 RETORNO DEL HOOK
  return {
    // Datos
    vehiculos: Array.isArray(vehiculos) ? vehiculos : [],
    loading,
    error,
    filters,
    pagination,
    
    // Acciones de CRUD
    loadVehiculos,
    createVehiculo,
    updateVehiculo,
    deleteVehiculo,
    
    // Manejo de paginación
    handlePageChange,
    
    // Manejo de filtros
    handleSearch,
    handleSectorFilter,
    handleEstadoFilter,
    handleTipoFilter,
    resetFilters,
    
    // Utilitarios
    setFilters: (newFilters) => {
      if (!loading && mountedRef.current) {
        setFilters(prev => ({ ...prev, ...newFilters }));
      }
    },
    
    // Estado
    hasVehiculos: Array.isArray(vehiculos) && vehiculos.length > 0,
    isFiltered: filters.search || filters.sector || filters.estado || filters.tipo
  };
};

export default useVehiculos;