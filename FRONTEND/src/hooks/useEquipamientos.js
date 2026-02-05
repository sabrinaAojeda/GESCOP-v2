// src/hooks/useEquipamientos.js - VERSIÓN ESTANDARIZADA (PATRÓN PERSONAL)
import { useState, useEffect, useCallback, useRef } from 'react';
import equipamientoService from '../services/equipamientoService';
import { useModal } from './useModal';

const HookLogger = {
  info: (message, data = null) => {
    console.info(`🎯 [useEquipamientos] ${message}`, data || '');
  },
  error: (message, data = null) => {
    console.error(`💥 [useEquipamientos] ${message}`, data || '');
  },
  debug: (message, data = null) => {
    console.log(`🔧 [useEquipamientos] ${message}`, data || '');
  }
};

export const useEquipamientos = () => {
  const [equipamientos, setEquipamientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEquipamiento, setSelectedEquipamiento] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 50,
    total: 0,
    total_pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    tipo: '',
    estado: '',
    page: 1
  });

  // ===== MODALES (PATRÓN PERSONAL) =====
  const createModal = useModal(false);
  const editModal = useModal(false);
  const viewModal = useModal(false);
  const deleteModal = useModal(false);
  const documentacionModal = useModal(false);
  const cargaMasivaModal = useModal(false);

  // Estado para carga masiva
  const [mostrarCargaMasiva, setMostrarCargaMasiva] = useState(false);

  const mountedRef = useRef(false);
  const initialLoadRef = useRef(false);

  // 🎯 CARGAR EQUIPAMIENTOS DESDE EL BACKEND
  const loadEquipamientos = useCallback(async (newFilters = {}) => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const updatedFilters = { ...filters, ...newFilters };
      HookLogger.info('Iniciando carga de equipamientos', updatedFilters);

      const response = await equipamientoService.getEquipamientos(updatedFilters);

      if (mountedRef.current) {
        if (response.success && response.data) {
          const equipamientosData = response.data.equipamientos || response.data || [];
          const paginationData = response.data.pagination || {
            current_page: updatedFilters.page,
            per_page: updatedFilters.limit || 50,
            total: equipamientosData.length,
            total_pages: Math.ceil(equipamientosData.length / (updatedFilters.limit || 50))
          };

          HookLogger.info(`✅ Carga completada: ${equipamientosData.length} equipamientos`);

          setEquipamientos(equipamientosData);
          setPagination(paginationData);
          setFilters(updatedFilters);
        } else {
          throw new Error(response.message || 'Error en la respuesta del servidor');
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMsg = err.message || 'Error al cargar los equipamientos';
        HookLogger.error('Error en carga', {
          error: err.message,
          userMessage: errorMsg
        });

        setError(errorMsg);
        setEquipamientos([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [filters]);

  // 🎯 CARGA INICIAL - SOLO UNA VEZ
  useEffect(() => {
    mountedRef.current = true;
    initialLoadRef.current = true;
    
    HookLogger.info('Hook montado - iniciando carga inicial');
    
    // Cargar sin await para evitar bloqueos
    loadEquipamientos();
    
    return () => {
      mountedRef.current = false;
      HookLogger.debug('Hook desmontado');
    };
  }, []); // DEPENDENCIA VACÍA - solo se ejecuta una vez al montar

  // 🎯 CREAR EQUIPAMIENTO
  const createEquipamiento = async (equipamientoData) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };

    setLoading(true);
    setError(null);

    try {
      HookLogger.info('Creando equipamiento', { codigo: equipamientoData.codigo });
      const resultado = await equipamientoService.createEquipamiento(equipamientoData);

      if (resultado.success) {
        await loadEquipamientos({ page: 1 });
        HookLogger.info('✅ Equipamiento creado exitosamente');
        createModal.closeModal();
        return { success: true, message: resultado.message };
      } else {
        const errorMsg = resultado.message || 'Error al crear el equipamiento';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al crear el equipamiento';
      HookLogger.error('Error al crear equipamiento', {
        codigo: equipamientoData.codigo,
        error: err.message
      });

      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  // 🎯 ACTUALIZAR EQUIPAMIENTO
  const updateEquipamiento = async (id, equipamientoData) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };

    setLoading(true);
    setError(null);

    try {
      HookLogger.info('Actualizando equipamiento', { id });
      const resultado = await equipamientoService.updateEquipamiento(id, equipamientoData);

      if (resultado.success) {
        await loadEquipamientos({ page: filters.page });
        HookLogger.info('✅ Equipamiento actualizado exitosamente');
        editModal.closeModal();
        return { success: true, message: resultado.message };
      } else {
        const errorMsg = resultado.message || 'Error al actualizar el equipamiento';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar el equipamiento';
      HookLogger.error('Error al actualizar equipamiento', {
        id,
        error: err.message
      });

      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  // 🎯 ELIMINAR EQUIPAMIENTO
  const deleteEquipamiento = async (id) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };

    setLoading(true);
    setError(null);

    try {
      HookLogger.info('Eliminando equipamiento', { id });
      const resultado = await equipamientoService.deleteEquipamiento(id);

      if (resultado.success) {
        await loadEquipamientos({ page: filters.page });
        HookLogger.info('✅ Equipamiento eliminado exitosamente');
        deleteModal.closeModal();
        return { success: true, message: resultado.message };
      } else {
        const errorMsg = resultado.message || 'Error al eliminar el equipamiento';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al eliminar el equipamiento';
      HookLogger.error('Error al eliminar equipamiento', {
        id,
        error: err.message
      });

      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  // 🎯 MANEJADORES DE FILTROS
  const handleSearch = (searchTerm) => {
    if (!loading && mountedRef.current) {
      loadEquipamientos({ search: searchTerm, page: 1 });
    }
  };

  const handleTipoFilter = (tipo) => {
    if (!loading && mountedRef.current) {
      loadEquipamientos({ tipo, page: 1 });
    }
  };

  const handleEstadoFilter = (estado) => {
    if (!loading && mountedRef.current) {
      loadEquipamientos({ estado, page: 1 });
    }
  };

  const handlePageChange = (newPage) => {
    if (!loading && mountedRef.current) {
      loadEquipamientos({ page: newPage });
    }
  };

  const resetFilters = () => {
    if (!loading && mountedRef.current) {
      loadEquipamientos({ search: '', tipo: '', estado: '', page: 1 });
    }
  };

  // ===== FUNCIONES PARA ABRIR CERRAR MODALES (PATRÓN PERSONAL) =====
  const openCreateModal = useCallback(() => {
    setSelectedEquipamiento(null);
    createModal.openModal();
  }, [createModal]);

  const openEditModal = useCallback((equipamiento) => {
    setSelectedEquipamiento(equipamiento);
    editModal.openModal();
  }, [editModal]);

  const openViewModal = useCallback((equipamiento) => {
    setSelectedEquipamiento(equipamiento);
    viewModal.openModal();
  }, [viewModal]);

  const openDeleteModal = useCallback((equipamiento) => {
    setSelectedEquipamiento(equipamiento);
    deleteModal.openModal();
  }, [deleteModal]);

  const openCargaMasivaModal = useCallback(() => {
    setMostrarCargaMasiva(true);
    cargaMasivaModal.openModal();
  }, [cargaMasivaModal]);

  const openDocumentacionModal = useCallback((equipamiento) => {
    setSelectedEquipamiento(equipamiento);
    documentacionModal.openModal();
  }, [documentacionModal]);

  // 🎯 RETORNO DEL HOOK
  return {
    equipamientos: Array.isArray(equipamientos) ? equipamientos : [],
    loading,
    error,
    selectedEquipamiento,
    pagination,
    filters,
    createEquipamiento,
    updateEquipamiento,
    deleteEquipamiento,
    loadEquipamientos,
    handleSearch,
    handleTipoFilter,
    handleEstadoFilter,
    handlePageChange,
    resetFilters,
    hasEquipamientos: Array.isArray(equipamientos) && equipamientos.length > 0,
    isFiltered: filters.search || filters.tipo || filters.estado,
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
    openCargaMasivaModal: cargaMasivaModal.openModal,
    openDocumentacionModal,
    // Funciones para cerrar modales
    closeCreateModal: createModal.closeModal,
    closeEditModal: editModal.closeModal,
    closeViewModal: viewModal.closeModal,
    closeDeleteModal: deleteModal.closeModal,
    closeCargaMasivaModal: cargaMasivaModal.closeModal,
    closeDocumentacionModal: documentacionModal.closeModal,
    // Estado de carga masiva
    mostrarCargaMasiva,
    setMostrarCargaMasiva
  };
};

export default useEquipamientos;
