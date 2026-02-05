// src/hooks/useVehiculosVendidos.js - VERSIÓN ESTANDARIZADA (PATRÓN PERSONAL)
import { useState, useEffect, useCallback, useRef } from 'react';
import vehiculosVendidosService from '../services/vehiculosVendidosService';
import { useModal } from './useModal';

const HookLogger = {
  info: (message, data = null) => {
    console.info(`💰 [useVehiculosVendidos] ${message}`, data || '');
  },
  error: (message, data = null) => {
    console.error(`💥 [useVehiculosVendidos] ${message}`, data || '');
  },
  debug: (message, data = null) => {
    console.log(`🔧 [useVehiculosVendidos] ${message}`, data || '');
  }
};

export const useVehiculosVendidos = () => {
  // ===== ESTADOS PRINCIPALES =====
  const [vehiculosVendidos, setVehiculosVendidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVehiculoVendido, setSelectedVehiculoVendido] = useState(null);
  
  // Estados de filtros y paginación
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 50,
    total: 0,
    total_pages: 0
  });
  
  const [filters, setFilters] = useState({
    search: '',
    estado_documentacion: '',
    page: 1
  });

  // ===== MODALES (PATRÓN PERSONAL) =====
  const createModal = useModal(false);
  const editModal = useModal(false);
  const viewModal = useModal(false);
  const deleteModal = useModal(false);
  const documentacionModal = useModal(false);

  const mountedRef = useRef(false);

  // ===== FIELD MAPPING (Frontend → Backend) =====
  const mapFrontendToBackend = useCallback((data) => {
    return {
      interno_original: data.interno || data.interno_original || '',
      nuevo_propietario: data.comprador || data.nuevo_propietario || '',
      dni_propietario: data.dni_propietario || '',
      fecha_venta: data.fecha_venta || '',
      precio: data.precio || 0,
      forma_pago: data.forma_pago || '',
      estado_documentacion: data.estado_documentacion || 'En trámite',
      observaciones: data.observaciones || '',
      dominio: data.dominio || '',
      marca_modelo: data.marca_modelo || ''
    };
  }, []);

  // ===== FIELD MAPPING (Backend → Frontend) =====
  const mapBackendToFrontend = useCallback((data) => {
    return {
      ...data,
      // Ensure all required fields exist
      interno: data.interno_original || data.interno,
      comprador: data.nuevo_propietario,
      marca_modelo: `${data.marca || ''} ${data.modelo || ''}`.trim()
    };
  }, []);

  // 🎯 CARGAR VEHÍCULOS VENDIDOS DESDE EL BACKEND
  const loadVehiculosVendidos = useCallback(async (newFilters = {}) => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const updatedFilters = { ...filters, ...newFilters };
      HookLogger.info('Iniciando carga de vehículos vendidos', updatedFilters);

      const response = await vehiculosVendidosService.getVehiculosVendidos(updatedFilters);

      if (mountedRef.current) {
        if (response.success && response.data) {
          const vehiculosData = (response.data.vehiculos_vendidos || response.data || []).map(mapBackendToFrontend);
          const paginationData = response.data.pagination || {
            current_page: updatedFilters.page,
            per_page: updatedFilters.limit || 50,
            total: vehiculosData.length,
            total_pages: Math.ceil(vehiculosData.length / (updatedFilters.limit || 50))
          };

          HookLogger.info(`✅ Carga completada: ${vehiculosData.length} vehículos vendidos`);

          setVehiculosVendidos(vehiculosData);
          setPagination(paginationData);
          setFilters(updatedFilters);
        } else {
          throw new Error(response.message || 'Error en la respuesta del servidor');
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMsg = err.message || 'Error al cargar los vehículos vendidos';
        HookLogger.error('Error en carga', { error: err.message, userMessage: errorMsg });
        setError(errorMsg);
        setVehiculosVendidos([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [filters, mapBackendToFrontend]);

  // 🎯 CARGA INICIAL - SOLO UNA VEZ
  useEffect(() => {
    mountedRef.current = true;
    HookLogger.info('Hook montado - iniciando carga inicial');
    loadVehiculosVendidos();
    
    return () => {
      mountedRef.current = false;
      HookLogger.debug('Hook desmontado');
    };
  }, []); // DEPENDENCIA VACÍA

  // 🎯 CREAR VEHÍCULO VENDIDO
  const createVehiculoVendido = useCallback(async (vehiculoData) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };

    setLoading(true);
    setError(null);

    try {
      HookLogger.info('Creando vehículo vendido', { dominio: vehiculoData.dominio });
      
      // Mapear campos frontend → backend
      const datosParaEnviar = mapFrontendToBackend(vehiculoData);
      const resultado = await vehiculosVendidosService.createVehiculoVendido(datosParaEnviar);

      if (resultado.success) {
        HookLogger.info('✅ Vehículo vendido creado exitosamente');
        createModal.closeModal();
        await loadVehiculosVendidos({ page: 1 });
        return { success: true, message: resultado.message };
      } else {
        const errorMsg = resultado.message || 'Error al crear el vehículo vendido';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al crear el vehículo vendido';
      HookLogger.error('Error al crear vehículo vendido', { dominio: vehiculoData.dominio, error: err.message });
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [loading, createModal, loadVehiculosVendidos, mapFrontendToBackend]);

  // 🎯 ACTUALIZAR VEHÍCULO VENDIDO
  const updateVehiculoVendido = useCallback(async (id, vehiculoData) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };

    setLoading(true);
    setError(null);

    try {
      HookLogger.info('Actualizando vehículo vendido', { id });
      
      // Mapear campos frontend → backend
      const datosParaEnviar = mapFrontendToBackend(vehiculoData);
      const resultado = await vehiculosVendidosService.updateVehiculoVendido(id, datosParaEnviar);

      if (resultado.success) {
        HookLogger.info('✅ Vehículo vendido actualizado exitosamente');
        editModal.closeModal();
        await loadVehiculosVendidos({ page: filters.page });
        return { success: true, message: resultado.message };
      } else {
        const errorMsg = resultado.message || 'Error al actualizar el vehículo vendido';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar el vehículo vendido';
      HookLogger.error('Error al actualizar vehículo vendido', { id, error: err.message });
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [loading, editModal, loadVehiculosVendidos, filters.page, mapFrontendToBackend]);

  // 🎯 ELIMINAR VEHÍCULO VENDIDO
  const deleteVehiculoVendido = useCallback(async (id) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };

    setLoading(true);
    setError(null);

    try {
      HookLogger.info('Eliminando vehículo vendido', { id });
      const resultado = await vehiculosVendidosService.deleteVehiculoVendido(id);

      if (resultado.success) {
        HookLogger.info('✅ Vehículo vendido eliminado exitosamente');
        deleteModal.closeModal();
        await loadVehiculosVendidos({ page: filters.page });
        return { success: true, message: resultado.message };
      } else {
        const errorMsg = resultado.message || 'Error al eliminar el vehículo vendido';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al eliminar el vehículo vendido';
      HookLogger.error('Error al eliminar vehículo vendido', { id, error: err.message });
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [loading, deleteModal, loadVehiculosVendidos, filters.page]);

  // ===== FUNCIONES PARA ABRIR CERRAR MODALES (PATRÓN PERSONAL) =====
  const openCreateModal = useCallback(() => {
    setSelectedVehiculoVendido(null);
    createModal.openModal();
  }, [createModal]);

  const openEditModal = useCallback((vehiculo) => {
    setSelectedVehiculoVendido(vehiculo);
    editModal.openModal();
  }, [editModal]);

  const openViewModal = useCallback((vehiculo) => {
    setSelectedVehiculoVendido(vehiculo);
    viewModal.openModal();
  }, [viewModal]);

  const openDeleteModal = useCallback((vehiculo) => {
    setSelectedVehiculoVendido(vehiculo);
    deleteModal.openModal();
  }, [deleteModal]);

  const openDocumentacionModal = useCallback((vehiculo) => {
    setSelectedVehiculoVendido(vehiculo);
    documentacionModal.openModal();
  }, [documentacionModal]);

  // 🎯 MANEJADORES DE FILTROS
  const handleSearch = useCallback((searchTerm) => {
    if (!loading && mountedRef.current) {
      loadVehiculosVendidos({ search: searchTerm, page: 1 });
    }
  }, [loading, loadVehiculosVendidos]);

  const handleEstadoDocumentacionFilter = useCallback((estado) => {
    if (!loading && mountedRef.current) {
      loadVehiculosVendidos({ estado_documentacion: estado, page: 1 });
    }
  }, [loading, loadVehiculosVendidos]);

  const handlePageChange = useCallback((newPage) => {
    if (!loading && mountedRef.current) {
      loadVehiculosVendidos({ page: newPage });
    }
  }, [loading, loadVehiculosVendidos]);

  const resetFilters = useCallback(() => {
    if (!loading && mountedRef.current) {
      loadVehiculosVendidos({ search: '', estado_documentacion: '', page: 1 });
    }
  }, [loading, loadVehiculosVendidos]);

  // 🎯 RETORNO DEL HOOK
  return {
    // Estados principales
    vehiculosVendidos: Array.isArray(vehiculosVendidos) ? vehiculosVendidos : [],
    loading,
    error,
    selectedVehiculoVendido,
    
    // Filtros y paginación
    pagination,
    filters,
    
    // Funciones CRUD
    createVehiculoVendido,
    updateVehiculoVendido,
    deleteVehiculoVendido,
    loadVehiculosVendidos,
    
    // Funciones de filtros
    handleSearch,
    handleEstadoDocumentacionFilter,
    handlePageChange,
    resetFilters,
    
    // Utilidades
    hasVehiculosVendidos: Array.isArray(vehiculosVendidos) && vehiculosVendidos.length > 0,
    isFiltered: filters.search || filters.estado_documentacion,
    
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
