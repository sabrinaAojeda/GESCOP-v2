// src/hooks/usePersonalCRUD.js - VERSIÓN CONECTADA AL BACKEND REAL
import { useState, useEffect, useCallback, useRef } from 'react';
import { personalService } from '../services';
import { useModal } from './useModal';

const usePersonalCRUD = () => {
  // Estados principales
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPersonal, setSelectedPersonal] = useState(null);
  
  // Filtros y paginación
  const [filters, setFilters] = useState({
    search: '',
    sector: '',
    estado: '',
    page: 1,
    limit: 10
  });
  
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0
  });
  
  // Documentos
  const [documents, setDocuments] = useState([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  
  // Modales
  const createModal = useModal(false);
  const editModal = useModal(false);
  const viewModal = useModal(false);
  const deleteModal = useModal(false);
  const documentModal = useModal(false);
  
  // Refs para control
  const mountedRef = useRef(true);
  const searchTimeoutRef = useRef(null);

  // 🔄 FUNCIÓN PRINCIPAL PARA CARGAR PERSONAL
  const loadPersonal = useCallback(async (newFilters = {}) => {
    if (!mountedRef.current) return;
    
    console.log('📡 [usePersonalCRUD] Cargando personal desde backend...');
    setLoading(true);
    setError(null);
    
    try {
      const updatedFilters = { 
        ...filters, 
        ...newFilters,
        page: newFilters.page || 1
      };
      
      console.log('📊 [usePersonalCRUD] Filtros:', updatedFilters);
      
      const result = await personalService.getPersonal(updatedFilters);
      
      if (result.success) {
        console.log(`✅ [usePersonalCRUD] Carga exitosa: ${result.data?.length || 0} registros`);
        
        // Procesar datos del backend
        const processedData = (result.data || []).map(person => ({
          ...person,
          // Asegurar que todos los campos estén presentes
          legajo: person.legajo || `P${String(person.id).padStart(4, '0')}`,
          correo_corporativo: person.correo_corporativo || person.email_corporativo || '',
          cuil: person.cuil || '',
          telefono: person.telefono || '',
          licencia_conducir: person.licencia_conducir || '',
          vencimiento_licencia: person.vencimiento_licencia || '',
          categoria_licencia: person.categoria_licencia || person.clase_licencia || '',
          carnet_cargas_peligrosas: person.carnet_cargas_peligrosas || '',
          vencimiento_carnet: person.vencimiento_carnet || '',
          rol: person.rol_sistema || person.rol || 'usuario',
          base_operativa: person.base_operativa || '',
          habilitacion_tipo: person.habilitacion_tipo || '',
          tipo_contrato: person.tipo_contrato || 'Planta Permanente',
          fecha_nacimiento: person.fecha_nacimiento || '',
          direccion: person.direccion || '',
          observaciones: person.observaciones || '',
          certificados_capacitacion: person.certificados_capacitacion || ''
        }));
        
        setPersonal(processedData);
        setPagination(result.pagination || {
          current_page: updatedFilters.page,
          per_page: updatedFilters.limit,
          total: (result.data || []).length,
          total_pages: Math.ceil((result.data || []).length / updatedFilters.limit) || 1
        });
        
        setFilters(updatedFilters);
        
      } else {
        throw new Error(result.error || 'Error al cargar el personal');
      }
    } catch (err) {
      console.error('💥 [usePersonalCRUD] Error:', err.message);
      setError(err.message || 'Error al cargar el personal');
      
      // NO usar datos mock en producción
      if (import.meta.env.DEV) {
        console.warn('🔄 [usePersonalCRUD] Modo desarrollo - Revisar conexión backend');
        // Dejar arrays vacíos para forzar la conexión real
        setPersonal([]);
        setPagination({
          current_page: 1,
          per_page: 10,
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

  // 🔍 BÚSQUEDA CON DEBOUNCE
  const handleSearch = useCallback((searchTerm) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      loadPersonal({ search: searchTerm, page: 1 });
    }, 500);
  }, [loadPersonal]);

  // 📋 FILTRAR POR SECTOR
  const handleFilterSector = useCallback((sector) => {
    loadPersonal({ sector, page: 1 });
  }, [loadPersonal]);

  // 📋 FILTRAR POR ESTADO
  const handleFilterEstado = useCallback((estado) => {
    loadPersonal({ estado, page: 1 });
  }, [loadPersonal]);

  // 🧹 LIMPIAR FILTROS
  const clearFilters = useCallback(() => {
    const defaultFilters = {
      search: '',
      sector: '',
      estado: '',
      page: 1,
      limit: 10
    };
    
    setFilters(defaultFilters);
    loadPersonal(defaultFilters);
  }, [loadPersonal]);

  // ➕ CREAR NUEVO PERSONAL - CON TODOS LOS CAMPOS
  const handleCreate = useCallback(async (personalData) => {
    setLoading(true);
    
    try {
      console.log('➕ [usePersonalCRUD] Creando personal:', personalData);
      
      // Preparar datos completos para el backend
      const dataToSend = {
        nombre: personalData.nombre,
        apellido: personalData.apellido,
        dni: personalData.dni,
        cuil: personalData.cuil,
        legajo: personalData.legajo,
        telefono: personalData.telefono,
        email: personalData.email,
        correo_corporativo: personalData.correo_corporativo,
        puesto: personalData.cargo,
        sector: personalData.sector,
        rol_sistema: personalData.rol,
        fecha_ingreso: personalData.fecha_ingreso,
        fecha_nacimiento: personalData.fecha_nacimiento,
        direccion: personalData.direccion,
        tipo_contrato: personalData.tipo_contrato,
        estado_licencia: personalData.licencia_conducir ? 'Vigente' : '',
        clase_licencia: personalData.categoria_licencia,
        vencimiento_licencia: personalData.vencimiento_licencia,
        certificados: personalData.certificados_capacitacion,
        carnet_cargas_peligrosas: personalData.carnet_cargas_peligrosas,
        vencimiento_carnet: personalData.vencimiento_carnet,
        observaciones: personalData.observaciones,
        activo: personalData.estado === 'Activo' ? 1 : 0
      };
      
      const result = await personalService.createPersonal(dataToSend);
      
      if (result.success) {
        alert('✅ ' + (result.message || 'Personal creado exitosamente'));
        createModal.closeModal();
        await loadPersonal({ page: 1 });
      } else {
        throw new Error(result.error || 'Error al crear el personal');
      }
    } catch (err) {
      console.error('💥 [usePersonalCRUD] Error creating:', err);
      alert('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [loadPersonal, createModal]);

  // ✏️ EDITAR PERSONAL - CON TODOS LOS CAMPOS
  const handleEdit = useCallback(async (id, personalData) => {
    setLoading(true);
    
    try {
      console.log(`✏️ [usePersonalCRUD] Editando ID: ${id}`, personalData);
      
      // Preparar datos completos para el backend
      const dataToSend = {
        id: id,
        nombre: personalData.nombre,
        apellido: personalData.apellido,
        dni: personalData.dni,
        cuil: personalData.cuil,
        legajo: personalData.legajo,
        telefono: personalData.telefono,
        email: personalData.email,
        correo_corporativo: personalData.correo_corporativo,
        puesto: personalData.cargo,
        sector: personalData.sector,
        rol_sistema: personalData.rol,
        fecha_ingreso: personalData.fecha_ingreso,
        fecha_nacimiento: personalData.fecha_nacimiento,
        direccion: personalData.direccion,
        tipo_contrato: personalData.tipo_contrato,
        estado_licencia: personalData.licencia_conducir ? 'Vigente' : '',
        clase_licencia: personalData.categoria_licencia,
        vencimiento_licencia: personalData.vencimiento_licencia,
        certificados: personalData.certificados_capacitacion,
        carnet_cargas_peligrosas: personalData.carnet_cargas_peligrosas,
        vencimiento_carnet: personalData.vencimiento_carnet,
        observaciones: personalData.observaciones,
        activo: personalData.estado === 'Activo' ? 1 : 0
      };
      
      const result = await personalService.updatePersonal(id, dataToSend);
      
      if (result.success) {
        alert('✅ ' + (result.message || 'Personal actualizado exitosamente'));
        editModal.closeModal();
        await loadPersonal();
      } else {
        throw new Error(result.error || 'Error al actualizar el personal');
      }
    } catch (err) {
      console.error('💥 [usePersonalCRUD] Error updating:', err);
      alert('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [loadPersonal, editModal]);

  // 🗑️ ELIMINAR PERSONAL
  const handleDelete = useCallback(async (id) => {
    if (!confirm('¿Está seguro de eliminar este personal? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log(`🗑️ [usePersonalCRUD] Eliminando ID: ${id}`);
      const result = await personalService.deletePersonal(id);
      
      if (result.success) {
        alert('✅ ' + (result.message || 'Personal eliminado exitosamente'));
        deleteModal.closeModal();
        await loadPersonal({ page: 1 });
      } else {
        throw new Error(result.error || 'Error al eliminar el personal');
      }
    } catch (err) {
      console.error('💥 [usePersonalCRUD] Error deleting:', err);
      alert('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [deleteModal, loadPersonal]);

  // 📄 GESTIÓN DE DOCUMENTOS
  const loadDocuments = useCallback(async (personalId) => {
    if (!personalId) return;
    
    try {
      const result = await personalService.getDocuments(personalId);
      
      if (result.success) {
        setDocuments(result.data || []);
      }
    } catch (err) {
      console.error('💥 [usePersonalCRUD] Error loading documents:', err);
      // Si no hay endpoint de documentos, mostrar array vacío
      setDocuments([]);
    }
  }, []);

  // 📤 SUBIR DOCUMENTO
  const handleUploadDocument = useCallback(async (personalId, file, tipo = 'general') => {
    if (!personalId || !file) return false;
    
    setUploadingDocument(true);
    
    try {
      const result = await personalService.uploadDocument(personalId, file, tipo);
      
      if (result.success) {
        alert('✅ Documento subido exitosamente');
        await loadDocuments(personalId);
        return true;
      } else {
        throw new Error(result.error || 'Error al subir el documento');
      }
    } catch (err) {
      console.error('💥 [usePersonalCRUD] Error uploading:', err);
      alert('❌ ' + err.message);
      return false;
    } finally {
      setUploadingDocument(false);
    }
  }, [loadDocuments]);

  // 🔄 PAGINACIÓN
  const handlePageChange = useCallback((newPage) => {
    loadPersonal({ page: newPage });
  }, [loadPersonal]);

  // 📊 CALCULAR ESTADÍSTICAS
  const calculateStats = useCallback(() => {
    const active = personal.filter(p => p.estado === 'Activo' || p.activo === 1).length;
    const inactive = personal.filter(p => p.estado === 'Inactivo' || p.activo === 0).length;
    const total = personal.length;
    
    return { active, inactive, total };
  }, [personal]);

  // 🗂️ ABRIR MODALES
  const openCreateModal = useCallback(() => {
    setSelectedPersonal(null);
    createModal.openModal();
  }, [createModal]);

  const openEditModal = useCallback((person) => {
    setSelectedPersonal(person);
    editModal.openModal();
  }, [editModal]);

  const openViewModal = useCallback((person) => {
    setSelectedPersonal(person);
    viewModal.openModal();
  }, [viewModal]);

  const openDeleteModal = useCallback((person) => {
    setSelectedPersonal(person);
    deleteModal.openModal();
  }, [deleteModal]);

  const openDocumentModal = useCallback(async (person) => {
    setSelectedPersonal(person);
    documentModal.openModal();
    await loadDocuments(person.id);
  }, [documentModal, loadDocuments]);

  // 📥 EXPORTAR DATOS
  const exportData = useCallback(() => {
    try {
      if (personal.length === 0) {
        alert('⚠️ No hay datos para exportar');
        return;
      }
      
      const dataToExport = personal.map(person => ({
        Legajo: person.legajo,
        Nombre: person.nombre,
        Apellido: person.apellido,
        DNI: person.dni,
        CUIL: person.cuil,
        Teléfono: person.telefono,
        'Email Personal': person.email,
        'Email Corporativo': person.correo_corporativo,
        Sector: person.sector,
        Cargo: person.cargo || person.puesto,
        'Rol Sistema': person.rol_sistema || person.rol,
        'Fecha Ingreso': person.fecha_ingreso,
        'Fecha Nacimiento': person.fecha_nacimiento,
        'Licencia Conducir': person.licencia_conducir,
        'Vencimiento Licencia': person.vencimiento_licencia,
        'Categoría Licencia': person.categoria_licencia || person.clase_licencia,
        'Carnet Cargas Peligrosas': person.carnet_cargas_peligrosas,
        'Vencimiento Carnet': person.vencimiento_carnet,
        Estado: person.estado
      }));
      
      const headers = Object.keys(dataToExport[0] || {}).join(',');
      const rows = dataToExport.map(row => 
        Object.values(row).map(value => `"${value || ''}"`).join(',')
      ).join('\n');
      
      const csv = `${headers}\n${rows}`;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personal_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      alert('✅ Datos exportados exitosamente');
    } catch (err) {
      console.error('💥 [usePersonalCRUD] Error exporting:', err);
      alert('❌ Error al exportar datos');
    }
  }, [personal]);

  // 🏁 INICIALIZACIÓN
  useEffect(() => {
    mountedRef.current = true;
    
    // Cargar datos iniciales desde el backend
    console.log('🚀 [usePersonalCRUD] Ejecutando carga inicial desde backend');
    loadPersonal();
    
    return () => {
      mountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const stats = calculateStats();

  return {
    // Datos
    personal,
    loading,
    error,
    selectedPersonal,
    documents,
    uploadingDocument,
    
    // Filtros y paginación
    filters,
    pagination,
    stats,
    
    // Funciones de filtrado
    handleSearch,
    handleFilterSector,
    handleFilterEstado,
    clearFilters,
    handlePageChange,
    
    // Funciones CRUD
    handleCreate,
    handleEdit,
    handleDelete,
    
    // Funciones de documentos
    loadDocuments,
    handleUploadDocument,
    
    // Funciones de exportación
    exportData,
    
    // Estados de modales
    isCreateModalOpen: createModal.isOpen,
    isEditModalOpen: editModal.isOpen,
    isViewModalOpen: viewModal.isOpen,
    isDeleteModalOpen: deleteModal.isOpen,
    isDocumentModalOpen: documentModal.isOpen,
    
    // Funciones para abrir modales
    openCreateModal,
    openEditModal,
    openViewModal,
    openDeleteModal,
    openDocumentModal,
    
    // Funciones para cerrar modales
    closeCreateModal: createModal.closeModal,
    closeEditModal: editModal.closeModal,
    closeViewModal: viewModal.closeModal,
    closeDeleteModal: deleteModal.closeModal,
    closeDocumentModal: documentModal.closeModal
  };
};

export { usePersonalCRUD };