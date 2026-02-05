// FRONTEND/src/hooks/useVehiculos.js - VERSIÓN ESTANDARIZADA (PATRÓN PERSONAL)
import { useState, useEffect, useRef, useCallback } from 'react';
import vehiculoService from '../services/vehiculoService';
import { useModal } from './useModal';

// Logger del hook
const HookLogger = {
  info: (message, data = null) => {
    console.info(`🎯 [useVehiculos] ${message}`, data || '');
  },
  error: (message, data = null) => {
    console.error(`💥 [useVehiculos] ${message}`, data || '');
  },
  debug: (message, data = null) => {
    console.log(`🔍 [useVehiculos] ${message}`, data || '');
  }
};

export const useVehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    search: '',
    sector: '',
    estado: '',
    tipo: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 50,
    total: 0,
    total_pages: 0
  });

  // ===== MODALES (PATRÓN PERSONAL) =====
  const createModal = useModal(false);
  const editModal = useModal(false);
  const viewModal = useModal(false);
  const deleteModal = useModal(false);
  const documentacionModal = useModal(false);

  const mountedRef = useRef(true); // CORREGIDO: Inicializar en true para permitir carga

  // 🎯 FUNCIÓN PARA CARGAR VEHÍCULOS DEL BACKEND
  const loadVehiculos = useCallback(async (newFilters = {}) => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);
    
    try {
      const updatedFilters = { ...filters, ...newFilters };
      HookLogger.info('Iniciando carga de vehículos', updatedFilters);
      
      const response = await vehiculoService.getVehiculos(updatedFilters);
      
      if (mountedRef.current) {
        if (response.success && response.data) {
          const vehiculosData = response.data.vehiculos || [];
          const paginationData = response.data.pagination || {
            current_page: updatedFilters.page,
            per_page: updatedFilters.limit,
            total: vehiculosData.length,
            total_pages: Math.ceil(vehiculosData.length / updatedFilters.limit)
          };
          
          HookLogger.info(`✅ Carga completada: ${vehiculosData.length} vehículos`);
          
          setVehiculos(vehiculosData);
          setPagination(paginationData);
          setFilters(updatedFilters);
        } else {
          throw new Error(response.message || 'Error en la respuesta del servidor');
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMsg = err.message || 'Error al cargar los vehículos';
        HookLogger.error('Error en carga', {
          error: err.message,
          userMessage: errorMsg
        });
        
        setError(errorMsg);
        setVehiculos([]);
        setPagination({
          current_page: 1,
          per_page: 50,
          total: 0,
          total_pages: 0
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [filters]);

  // 🎯 CREAR VEHÍCULO
  const createVehiculo = async (vehiculoData) => {
    if (loading) {
      return { success: false, error: 'Ya hay una operación en curso' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      HookLogger.info('Creando vehículo', { interno: vehiculoData.interno });
      const resultado = await vehiculoService.createVehiculo(vehiculoData);
      
      if (resultado.success) {
        await loadVehiculos({ page: 1 });
        HookLogger.info('✅ Vehículo creado exitosamente');
        createModal.closeModal();
        return { success: true, message: resultado.message };
      } else {
        const errorMsg = resultado.message || 'Error al crear el vehículo';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al crear el vehículo';
      HookLogger.error('Error al crear vehículo', {
        interno: vehiculoData.interno,
        error: err.message
      });
      
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // 🎯 ACTUALIZAR VEHÍCULO
  const updateVehiculo = async (interno, vehiculoData) => {
    if (loading) {
      return { success: false, error: 'Ya hay una operación en curso' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      HookLogger.info('Actualizando vehículo', { interno });
      const resultado = await vehiculoService.updateVehiculo(interno, vehiculoData);
      
      if (resultado.success) {
        await loadVehiculos({ page: filters.page });
        HookLogger.info('✅ Vehículo actualizado exitosamente');
        editModal.closeModal();
        return { success: true, message: resultado.message };
      } else {
        const errorMsg = resultado.message || 'Error al actualizar el vehículo';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar el vehículo';
      HookLogger.error('Error al actualizar vehículo', {
        interno,
        error: err.message
      });
      
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // 🎯 ELIMINAR VEHÍCULO
  const deleteVehiculo = async (interno) => {
    if (loading) {
      return { success: false, error: 'Ya hay una operación en curso' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      HookLogger.info('Eliminando vehículo', { interno });
      const resultado = await vehiculoService.deleteVehiculo(interno);
      
      if (resultado.success) {
        await loadVehiculos({ page: filters.page });
        HookLogger.info('✅ Vehículo eliminado exitosamente');
        deleteModal.closeModal();
        return { success: true, message: resultado.message };
      } else {
        const errorMsg = resultado.message || 'Error al eliminar el vehículo';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al eliminar el vehículo';
      HookLogger.error('Error al eliminar vehículo', {
        interno,
        error: err.message
      });
      
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // 🎯 MANEJADORES DE FILTROS
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

  const handlePageChange = (newPage) => {
    if (!loading && mountedRef.current) {
      loadVehiculos({ page: newPage });
    }
  };

  const resetFilters = () => {
    if (!loading && mountedRef.current) {
      loadVehiculos({ page: 1, limit: 50, search: '', sector: '', estado: '', tipo: '' });
    }
  };

  // ===== FUNCIONES PARA ABRIR CERRAR MODALES (PATRÓN PERSONAL) =====
  const openCreateModal = useCallback(() => {
    setSelectedVehiculo(null);
    createModal.openModal();
  }, [createModal]);

  const openEditModal = useCallback((vehiculo) => {
    setSelectedVehiculo(vehiculo);
    editModal.openModal();
  }, [editModal]);

  const openViewModal = useCallback((vehiculo) => {
    setSelectedVehiculo(vehiculo);
    viewModal.openModal();
  }, [viewModal]);

  const openDeleteModal = useCallback((vehiculo) => {
    setSelectedVehiculo(vehiculo);
    deleteModal.openModal();
  }, [deleteModal]);

  const openDocumentacionModal = useCallback((vehiculo) => {
    setSelectedVehiculo(vehiculo);
    documentacionModal.openModal();
  }, [documentacionModal]);

  // 🎯 RETORNO DEL HOOK
  return {
    vehiculos: Array.isArray(vehiculos) ? vehiculos : [],
    loading,
    error,
    selectedVehiculo,
    filters,
    pagination,
    createVehiculo,
    updateVehiculo,
    deleteVehiculo,
    loadVehiculos,
    handleSearch,
    handleSectorFilter,
    handleEstadoFilter,
    handleTipoFilter,
    handlePageChange,
    resetFilters,
    setFilters: (newFilters) => {
      if (!loading && mountedRef.current) {
        setFilters(prev => ({ ...prev, ...newFilters }));
      }
    },
    hasVehiculos: Array.isArray(vehiculos) && vehiculos.length > 0,
    isFiltered: filters.search || filters.sector || filters.estado || filters.tipo,
    stats: {
      total: vehiculos.length,
      activos: vehiculos.filter(v => v.estado === 'Activo').length,
      rodados: vehiculos.filter(v => v.tipo === 'Rodado').length,
      maquinarias: vehiculos.filter(v => v.tipo === 'Maquinaria').length,
      mantenimiento: vehiculos.filter(v => v.estado === 'Mantenimiento').length
    },
    // Estados de modales
    isCreateModalOpen: createModal.isOpen,
    isEditModalOpen: editModal.isOpen,
    isViewModalOpen: viewModal.isOpen,
    isDeleteModalOpen: deleteModal.isOpen,
    isDocumentacionModalOpen: documentacionModal.isOpen,
    // Funciones para abrir modales
    openCreateModal,
    openEditModal,
    openViewModal,
    openDeleteModal,
    openDocumentacionModal,
    // Funciones para cerrar modales
    closeCreateModal: createModal.closeModal,
    closeEditModal: editModal.closeModal,
    closeViewModal: viewModal.closeModal,
    closeDeleteModal: deleteModal.closeModal,
    closeDocumentacionModal: documentacionModal.closeModal
  };
};

export default useVehiculos;
