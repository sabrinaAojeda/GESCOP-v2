// FRONTEND/src/hooks/useSedes.js - VERSIÓN ESTANDARIZADA (PATRÓN PERSONAL)
import { useState, useCallback, useEffect } from 'react';
import sedesService from '../services/sedesService';
import { useModal } from './useModal';

const HookLogger = {
  info: (message, data = null) => console.info(`🎯 [useSedes] ${message}`, data || ''),
  error: (message, data = null) => console.error(`💥 [useSedes] ${message}`, data || ''),
  debug: (message, data = null) => console.log(`🔧 [useSedes] ${message}`, data || '')
};

const useSedes = () => {
  // ===== ESTADOS PRINCIPALES =====
  const [sedes, setSedes] = useState([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [habilitations, setHabilitations] = useState([]);
  
  // Estados de filtros
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1
  });

  const [filtros, setFiltros] = useState({
    search: '',
    provincia: '',
    estado: '',
    tipo: ''
  });

  // ===== MODALES (PATRÓN PERSONAL) =====
  const createModal = useModal(false);
  const editModal = useModal(false);
  const viewModal = useModal(false);
  const deleteModal = useModal(false);
  const habilitacionesModal = useModal(false);
  const documentosModal = useModal(false);

  // ===== FIELD MAPPING (Frontend → Backend) =====
  const mapFrontendToBackend = useCallback((data) => {
    return {
      codigo: data.codigo,
      nombre: data.nombre,
      tipo: data.tipo,
      direccion: data.direccion,
      localidad: data.localidad,
      provincia: data.provincia,
      telefono: data.telefono,
      email: data.email,
      responsable: data.responsable,
      empresa_id: data.empresa_id,
      tipo_habilitacion: data.tipo_habilitacion,
      habilitacion_numero: data.habilitacion_numero,
      vencimiento_habilitacion: data.vencimiento_habilitacion,
      certificaciones: data.certificaciones,
      seguridad_higiene: data.seguridad_higiene,
      procesos_quimicos: data.procesos_quimicos,
      vencimiento_procesos: data.vencimiento_procesos,
      base_madre_copesa: data.base_madre_copesa === 'Sí' ? 1 : 0,
      base_operativa: data.base_operativa,
      habilitada: data.habilitada === 'Si' ? 1 : 0,
      estado: data.estado,
      activo: data.estado === 'Activa' ? 1 : 0
    };
  }, []);

  // ===== FIELD MAPPING (Backend → Frontend) =====
  const mapBackendToFrontend = useCallback((data) => {
    return {
      ...data,
      base_madre_copesa: data.base_madre_copesa ? 'Sí' : 'No',
      habilitada: data.habilitada ? 'Si' : 'No',
      estado: data.estado || 'Activa'
    };
  }, []);

  // Obtener sedes con filtros
  const obtenerSedes = useCallback(async (page = 1, filtrosActuales = filtros) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit: pagination.per_page,
        ...filtrosActuales
      };

      const result = await sedesService.getSedes(params);
      
      if (result.success) {
        const sedesProcesadas = (result.data || []).map(mapBackendToFrontend);
        setSedes(sedesProcesadas);
        setPagination(result.pagination || pagination);
        return { success: true, data: sedesProcesadas };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener sedes';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [filtros, pagination.per_page, mapBackendToFrontend]);

  // Obtener una sede específica
  const obtenerSede = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await sedesService.getSede(id);
      
      if (result.success) {
        const sedeProcesada = mapBackendToFrontend(result.data);
        setSedeSeleccionada(sedeProcesada);
        return { success: true, data: sedeProcesada };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener sede';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [mapBackendToFrontend]);

  // Crear nueva sede
  const crearSede = useCallback(async (sedeData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mapear campos frontend → backend
      const datosParaEnviar = mapFrontendToBackend(sedeData);
      
      const result = await sedesService.createSede(datosParaEnviar);
      
      if (result.success) {
        HookLogger.info('Sede creada exitosamente');
        createModal.closeModal();
        await obtenerSedes(pagination.current_page);
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al crear sede';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [obtenerSedes, pagination.current_page, createModal, mapFrontendToBackend]);

  // Actualizar sede
  const actualizarSede = useCallback(async (id, sedeData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mapear campos frontend → backend
      const datosParaEnviar = mapFrontendToBackend(sedeData);
      
      const result = await sedesService.updateSede(id, datosParaEnviar);
      
      if (result.success) {
        HookLogger.info('Sede actualizada exitosamente');
        editModal.closeModal();
        await obtenerSedes(pagination.current_page);
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al actualizar sede';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [obtenerSedes, pagination.current_page, editModal, mapFrontendToBackend]);

  // Eliminar sede
  const eliminarSede = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await sedesService.deleteSede(id);
      
      if (result.success) {
        HookLogger.info('Sede eliminada exitosamente');
        deleteModal.closeModal();
        await obtenerSedes(pagination.current_page);
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al eliminar sede';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [obtenerSedes, pagination.current_page, deleteModal]);

  // Obtener habilitaciones de una sede
  const loadHabilitations = useCallback(async (sedeId) => {
    try {
      const result = await sedesService.getHabilitacionesSede(sedeId);
      if (result.success) {
        setHabilitations(result.data || []);
      }
    } catch (err) {
      HookLogger.error('Error cargando habilitaciones:', err);
      setHabilitations([]);
    }
  }, []);

  // Obtener documentos de una sede
  const loadDocuments = useCallback(async (sedeId) => {
    try {
      const result = await sedesService.getDocumentosSede(sedeId);
      if (result.success) {
        setDocuments(result.data || []);
      }
    } catch (err) {
      HookLogger.error('Error cargando documentos:', err);
      setDocuments([]);
    }
  }, []);

  // ===== FUNCIONES PARA ABRIR CERRAR MODALES (PATRÓN PERSONAL) =====
  const openCreateModal = useCallback(() => {
    setSedeSeleccionada(null);
    createModal.openModal();
  }, [createModal]);

  const openEditModal = useCallback((sede) => {
    setSedeSeleccionada(sede);
    editModal.openModal();
  }, [editModal]);

  const openViewModal = useCallback((sede) => {
    setSedeSeleccionada(sede);
    viewModal.openModal();
  }, [viewModal]);

  const openDeleteModal = useCallback((sede) => {
    setSedeSeleccionada(sede);
    deleteModal.openModal();
  }, [deleteModal]);

  const openHabilitacionesModal = useCallback(async (sede) => {
    setSedeSeleccionada(sede);
    habilitacionesModal.openModal();
    await loadHabilitations(sede.id);
  }, [habilitacionesModal, loadHabilitations]);

  const openDocumentosModal = useCallback(async (sede) => {
    setSedeSeleccionada(sede);
    documentosModal.openModal();
    await loadDocuments(sede.id);
  }, [documentosModal, loadDocuments]);

  // Actualizar filtros
  const actualizarFiltros = useCallback((nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  }, []);

  // Cambiar página
  const cambiarPagina = useCallback((nuevaPagina) => {
    setPagination(prev => ({ ...prev, current_page: nuevaPagina }));
  }, []);

  // Limpiar errores
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // Limpiar sede seleccionada
  const limpiarSedeSeleccionada = useCallback(() => {
    setSedeSeleccionada(null);
  }, []);

  // Carga inicial - SOLO UNA VEZ
  useEffect(() => {
    HookLogger.info('INICIANDO CARGA INICIAL DE SEDES');
    
    const executeLoad = async () => {
      try {
        await obtenerSedes();
      } catch (err) {
        HookLogger.error('Error en carga inicial:', err);
      }
    };
    
    executeLoad();
  }, []); // DEPENDENCY ARRAY VACÍO = solo se ejecuta una vez al montar

  return {
    // Estados principales
    sedes,
    sedeSeleccionada,
    loading,
    error,
    documents,
    habilitations,
    
    // Filtros y paginación
    pagination,
    filtros,
    
    // Funciones CRUD
    obtenerSedes,
    obtenerSede,
    crearSede,
    actualizarSede,
    eliminarSede,
    
    // Funciones de documentos y habilitaciones
    loadHabilitations,
    loadDocuments,
    
    // Funciones de filtros
    actualizarFiltros,
    cambiarPagina,
    limpiarError,
    limpiarSedeSeleccionada,
    setSedeSeleccionada,
    
    // Métodos útiles
    refetchSedes: () => obtenerSedes(pagination.current_page),
    
    // Estados de modales
    isCreateModalOpen: createModal.isOpen,
    isEditModalOpen: editModal.isOpen,
    isViewModalOpen: viewModal.isOpen,
    isDeleteModalOpen: deleteModal.isOpen,
    isHabilitacionesModalOpen: habilitacionesModal.isOpen,
    isDocumentosModalOpen: documentosModal.isOpen,
    
    // Funciones para abrir modales
    openCreateModal,
    openEditModal,
    openViewModal,
    openDeleteModal,
    openHabilitacionesModal,
    openDocumentosModal,
    
    // Funciones para cerrar modales
    closeCreateModal: createModal.closeModal,
    closeEditModal: editModal.closeModal,
    closeViewModal: viewModal.closeModal,
    closeDeleteModal: deleteModal.closeModal,
    closeHabilitacionesModal: habilitacionesModal.closeModal,
    closeDocumentosModal: documentosModal.closeModal
  };
};

export default useSedes;
