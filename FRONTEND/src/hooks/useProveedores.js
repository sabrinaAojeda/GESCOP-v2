// FRONTEND/src/hooks/useProveedores.js - VERSIÓN ESTANDARIZADA (PATRÓN PERSONAL)
import { useState, useEffect, useRef, useCallback } from 'react';
import proveedoresService from '../services/proveedoresService';
import { useModal } from './useModal';

let globalLoadStarted = false;

const HookLogger = {
  info: (message, data = null) => console.info(`🎯 [useProveedores] ${message}`, data || ''),
  error: (message, data = null) => console.error(`💥 [useProveedores] ${message}`, data || ''),
  debug: (message, data = null) => console.log(`🔧 [useProveedores] ${message}`, data || '')
};

export const useProveedores = () => {
  // ===== ESTADOS PRINCIPALES =====
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [documents, setDocuments] = useState([]);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    rubro: '',
    sector_servicio: '',
    estado: '',
    localidad: '',
    tiene_seguro_RT: ''
  });
  
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0
  });
  
  const [filterOptions, setFilterOptions] = useState({
    rubros: ['Todos los rubros'],
    sectores_servicio: ['Todos los sectores'],
    localidades: ['Todas las localidades'],
    estados: ['Todos los estados']
  });

  // ===== MODALES (PATRÓN PERSONAL) =====
  const createModal = useModal(false);
  const editModal = useModal(false);
  const viewModal = useModal(false);
  const deleteModal = useModal(false);
  const documentosModal = useModal(false);

  const mountedRef = useRef(true);
  const loadAttemptsRef = useRef(0);
  const initialLoadDoneRef = useRef(false);

  // ===== FIELD MAPPING (Frontend → Backend) =====
  const mapFrontendToBackend = useCallback((data) => {
    return {
      razon_social: data.razon_social,
      cuit: data.cuit,
      rubro: data.rubro,
      tipo_proveedor: data.tipo_proveedor,
      sector_servicio: data.sector_servicio || data.sector,
      servicio_especifico: data.servicio_especifico || data.servicio,
      direccion: data.direccion,
      localidad: data.localidad,
      provincia: data.provincia,
      telefono: data.telefono,
      email: data.email,
      contacto_nombre: data.contacto_nombre || data.contacto,
      contacto_cargo: data.contacto_cargo,
      seguro_RT: data.seguro_RT ? 1 : 0,
      seguro_vida_personal: data.seguro_vida ? 1 : 0,
      poliza_RT: data.poliza_RT,
      vencimiento_poliza_RT: data.vencimiento_poliza_RT,
      habilitacion_personal: data.habilitacion_personal,
      vencimiento_habilitacion_personal: data.vencimiento_habilitacion_personal,
      habilitacion_vehiculo: data.habilitacion_vehiculo,
      vencimiento_habilitacion_vehiculo: data.vencimiento_habilitacion_vehiculo,
      frecuencia_renovacion: data.frecuencia_renovacion
    };
  }, []);

  // ===== FIELD MAPPING (Backend → Frontend) =====
  const mapBackendToFrontend = useCallback((data) => {
    return {
      ...data,
      sector_servicio: data.sector_servicio || data.rubro || '',
      servicio: data.servicio_especifico || data.servicio || '',
      contacto: data.contacto_nombre || '',
      seguro_RT: data.seguro_RT ? true : false,
      seguro_vida: data.seguro_vida_personal ? true : false,
      personal_contratado: data.personal_contratado || 0,
      documentos: data.documentos || 0,
      vencimiento_documentacion: data.proximo_vencimiento || 
                                 data.vencimiento_documentacion ||
                                 new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    };
  }, []);

  const procesarRespuestaProveedores = (response) => {
    HookLogger.debug('Procesando respuesta del backend', response);
    
    if (response.success !== undefined && response.data) {
      return {
        data: response.data.proveedores || response.data || [],
        pagination: response.data.pagination || response.pagination,
        filterOptions: response.data.filters || response.filters || filterOptions
      };
    } else if (response.data) {
      return {
        data: response.data.proveedores || response.data || [],
        pagination: response.pagination,
        filterOptions: response.filters || filterOptions
      };
    } else {
      HookLogger.warn('Formato de respuesta inesperado', response);
      return { data: [], pagination: {}, filterOptions };
    }
  };

  const loadProveedores = useCallback(async (newFilters = {}) => {
    if (loading) {
      HookLogger.debug('Load bloqueado: ya está cargando');
      return;
    }

    // CORREGIDO: No bloquear cargas basadas en intentos - reiniciar contador en éxito
    // if (loadAttemptsRef.current >= 2) {
    //   HookLogger.debug('Load bloqueado: máximo de intentos alcanzado');
    //   return;
    // }

    loadAttemptsRef.current++;
    HookLogger.debug(`Intento de carga #${loadAttemptsRef.current}`);

    setLoading(true);
    setError(null);
    
    try {
      const updatedFilters = { 
        ...filters, 
        ...newFilters,
        tiene_seguro_RT: newFilters.tiene_seguro_RT || ''
      };
      
      HookLogger.info('Cargando proveedores con filtros:', updatedFilters);
      
      const response = await proveedoresService.getProveedores(updatedFilters);
      
      if (mountedRef.current) {
        const { data, pagination: paginationData, filterOptions: options } = procesarRespuestaProveedores(response);
        
        // Procesar datos para el frontend
        const proveedoresProcesados = data.map(mapBackendToFrontend);
        
        setProveedores(proveedoresProcesados);
        setPagination(paginationData || pagination);
        setFilters(updatedFilters);
        
        if (options) {
          setFilterOptions({
            rubros: ['Todos los rubros', ...(options.rubros || [])],
            sectores_servicio: ['Todos los sectores', ...(options.sectores_servicio || [])],
            localidades: ['Todas las localidades', ...(options.localidades || [])],
            estados: ['Todos los estados', ...(options.estados || [])]
          });
        }
        
        HookLogger.info(`Proveedores cargados: ${proveedoresProcesados.length} registros`);
        loadAttemptsRef.current = 0; // CORREGIDO: Reiniciar contador en éxito
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMsg = err.response?.data?.message || 'Error al cargar los proveedores';
        setError(errorMsg);
        HookLogger.error('Error loading proveedores:', {
          error: err.message,
          status: err.response?.status,
          url: err.config?.url
        });
        
        setProveedores([]);
        setPagination({
          current_page: 1,
          per_page: 10,
          total: 0,
          total_pages: 0
        });
        // CORREGIDO: No sobrescribir error con null
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [filters, pagination, filterOptions, mapBackendToFrontend]);

  // Crear proveedor con field mapping
  const createProveedor = useCallback(async (proveedorData) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };
    
    setLoading(true);
    setError(null);
    
    try {
      HookLogger.info('Creando proveedor:', proveedorData);
      
      // Mapear campos frontend → backend
      const datosParaEnviar = mapFrontendToBackend({
        ...proveedorData,
        // Generar código si no existe
        codigo: proveedorData.codigo || `PROV-${Date.now().toString().slice(-6)}`
      });
      
      const resultado = await proveedoresService.createProveedor(datosParaEnviar);
      
      if (resultado.success) {
        HookLogger.info('Proveedor creado exitosamente');
        createModal.closeModal();
        await loadProveedores();
        return { success: true, id: resultado.id };
      } else {
        const errorMsg = resultado.message || 'Error al crear el proveedor';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al crear el proveedor';
      HookLogger.error('Error al crear proveedor:', {
        error: err.message,
        status: err.response?.status
      });
      
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [loading, createModal, loadProveedores, mapFrontendToBackend]);

  // Actualizar proveedor con field mapping
  const updateProveedor = useCallback(async (id, proveedorData) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };
    
    setLoading(true);
    setError(null);
    
    try {
      HookLogger.info(`Actualizando proveedor ID: ${id}`, proveedorData);
      
      // Mapear campos frontend → backend
      const datosParaEnviar = mapFrontendToBackend(proveedorData);
      
      const resultado = await proveedoresService.updateProveedor(id, datosParaEnviar);
      
      if (resultado.success) {
        HookLogger.info('Proveedor actualizado exitosamente');
        editModal.closeModal();
        await loadProveedores();
        return { success: true };
      } else {
        const errorMsg = resultado.message || 'Error al actualizar el proveedor';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al actualizar el proveedor';
      HookLogger.error('Error al actualizar proveedor:', {
        id,
        error: err.message,
        status: err.response?.status
      });
      
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [loading, editModal, loadProveedores, mapFrontendToBackend]);

  // Eliminar proveedor
  const deleteProveedor = useCallback(async (id) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };
    
    setLoading(true);
    setError(null);
    
    try {
      HookLogger.info(`Eliminando proveedor ID: ${id}`);
      const resultado = await proveedoresService.deleteProveedor(id);
      
      if (resultado.success) {
        HookLogger.info('Proveedor eliminado exitosamente');
        deleteModal.closeModal();
        await loadProveedores();
        return { success: true };
      } else {
        const errorMsg = resultado.message || 'Error al eliminar el proveedor';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al eliminar el proveedor';
      HookLogger.error('Error al eliminar proveedor:', {
        id,
        error: err.message,
        status: err.response?.status
      });
      
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [loading, deleteModal, loadProveedores]);

  // Cargar documentos de proveedor
  const loadDocuments = useCallback(async (proveedorId) => {
    try {
      const resultado = await proveedoresService.getDocumentosProveedor(proveedorId);
      if (resultado.success) {
        setDocuments(resultado.data || []);
      }
    } catch (err) {
      HookLogger.error('Error cargando documentos:', err);
      setDocuments([]);
    }
  }, []);

  // ===== FUNCIONES PARA ABRIR CERRAR MODALES (PATRÓN PERSONAL) =====
  const openCreateModal = useCallback(() => {
    setSelectedProveedor(null);
    createModal.openModal();
  }, [createModal]);

  const openEditModal = useCallback((proveedor) => {
    setSelectedProveedor(proveedor);
    editModal.openModal();
  }, [editModal]);

  const openViewModal = useCallback((proveedor) => {
    setSelectedProveedor(proveedor);
    viewModal.openModal();
  }, [viewModal]);

  const openDeleteModal = useCallback((proveedor) => {
    setSelectedProveedor(proveedor);
    deleteModal.openModal();
  }, [deleteModal]);

  const openDocumentosModal = useCallback(async (proveedor) => {
    setSelectedProveedor(proveedor);
    documentosModal.openModal();
    await loadDocuments(proveedor.id);
  }, [documentosModal, loadDocuments]);

  // Filtros específicos
  const handleSearch = useCallback((searchTerm) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ search: searchTerm, page: 1 });
    }
  }, [loading, loadProveedores]);

  const handleRubroFilter = useCallback((rubro) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ rubro, page: 1 });
    }
  }, [loading, loadProveedores]);

  const handleSectorServicioFilter = useCallback((sector) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ sector_servicio: sector, page: 1 });
    }
  }, [loading, loadProveedores]);

  const handleEstadoFilter = useCallback((estado) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ estado, page: 1 });
    }
  }, [loading, loadProveedores]);

  const handleLocalidadFilter = useCallback((localidad) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ localidad, page: 1 });
    }
  }, [loading, loadProveedores]);

  const handleSeguroRTFilter = useCallback((tieneSeguro) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ tiene_seguro_RT: tieneSeguro, page: 1 });
    }
  }, [loading, loadProveedores]);

  const resetFilters = useCallback(() => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ 
        page: 1, 
        search: '', 
        rubro: '', 
        sector_servicio: '',
        estado: '', 
        localidad: '',
        tiene_seguro_RT: ''
      });
    }
  }, [loading, loadProveedores]);

  const handlePageChange = useCallback((newPage) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ page: newPage });
    }
  }, [loading, loadProveedores]);

  // Exportar con campos extendidos
  const exportToCSV = useCallback(() => {
    if (!proveedores.length) return;
    
    const headers = [
      'Código',
      'Razón Social', 
      'CUIT',
      'Rubro',
      'Sector de Servicio',
      'Servicio Específico',
      'Tipo de Proveedor',
      'Dirección',
      'Localidad',
      'Provincia',
      'Teléfono',
      'Email',
      'Contacto',
      'Cargo Contacto',
      'Estado',
      'Seguro RT',
      'Seguro Vida Personal',
      'Habilitación Personal',
      'Venc. Hab. Personal',
      'Habilitación Vehículo',
      'Venc. Hab. Vehículo',
      'Personal Contratado',
      'Documentos',
      'Próximo Vencimiento',
      'Frecuencia Renovación'
    ];
    
    const csvRows = [
      headers.join(','),
      ...proveedores.map(prov => [
        `"${prov.codigo || ''}"`,
        `"${prov.razon_social || ''}"`,
        `"${prov.cuit || ''}"`,
        `"${prov.rubro || ''}"`,
        `"${prov.sector_servicio || ''}"`,
        `"${prov.servicio || ''}"`,
        `"${prov.tipo_proveedor || ''}"`,
        `"${prov.direccion || ''}"`,
        `"${prov.localidad || ''}"`,
        `"${prov.provincia || ''}"`,
        `"${prov.telefono || ''}"`,
        `"${prov.email || ''}"`,
        `"${prov.contacto_nombre || ''}"`,
        `"${prov.contacto_cargo || ''}"`,
        `"${prov.estado || ''}"`,
        prov.seguro_RT ? 'Sí' : 'No',
        prov.seguro_vida ? 'Sí' : 'No',
        `"${prov.habilitacion_personal || ''}"`,
        `"${prov.vencimiento_habilitacion_personal || ''}"`,
        `"${prov.habilitacion_vehiculo || ''}"`,
        `"${prov.vencimiento_habilitacion_vehiculo || ''}"`,
        prov.personal_contratado || 0,
        prov.documentos || 0,
        `"${prov.vencimiento_documentacion || ''}"`,
        `"${prov.frecuencia_renovacion || ''}"`
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `proveedores_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    HookLogger.info('CSV exportado exitosamente');
  }, [proveedores]);

  // Carga inicial - SOLO UNA VEZ
  useEffect(() => {
    mountedRef.current = true;
    loadAttemptsRef.current = 0;
    initialLoadDoneRef.current = true;
    
    HookLogger.info('INICIANDO CARGA INICIAL ÚNICA DE PROVEEDORES');
    
    // Cargar inmediatamente sin timer
    const executeLoad = async () => {
      try {
        await loadProveedores();
      } catch (err) {
        HookLogger.error('Error en carga inicial:', err);
      }
    };
    
    executeLoad();
    
    return () => {
      mountedRef.current = false;
    };
  }, []); // DEPENDENCY ARRAY VACÍO = solo se ejecuta una vez al montar

  return {
    // Estados principales
    proveedores,
    loading,
    error,
    selectedProveedor,
    documents,
    
    // Filtros y paginación
    filters,
    pagination,
    filterOptions,
    
    // Funciones CRUD
    loadProveedores,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    
    // Funciones de filtros
    handlePageChange,
    handleSearch,
    handleRubroFilter,
    handleSectorServicioFilter,
    handleEstadoFilter,
    handleLocalidadFilter,
    handleSeguroRTFilter,
    resetFilters,
    
    // Exportar
    exportToCSV,
    
    // Estados de modales
    isCreateModalOpen: createModal.isOpen,
    isEditModalOpen: editModal.isOpen,
    isViewModalOpen: viewModal.isOpen,
    isDeleteModalOpen: deleteModal.isOpen,
    isDocumentosModalOpen: documentosModal.isOpen,
    
    // Funciones para abrir modales
    openCreateModal,
    openEditModal,
    openViewModal,
    openDeleteModal,
    openDocumentosModal,
    
    // Funciones para cerrar modales
    closeCreateModal: createModal.closeModal,
    closeEditModal: editModal.closeModal,
    closeViewModal: viewModal.closeModal,
    closeDeleteModal: deleteModal.closeModal,
    closeDocumentosModal: documentosModal.closeModal,
    
    // Documentos
    loadDocuments
  };
};