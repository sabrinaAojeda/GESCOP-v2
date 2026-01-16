// src/hooks/usePersonalCRUD.js - VERSIÓN CORREGIDA Y SIMPLIFICADA
import { useState, useEffect, useCallback, useRef } from 'react';
import { personalService } from '../services';
import { useModal } from './useModal';

const usePersonalCRUD = () => {
  // Estados principales
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true); // Iniciar como true para mostrar loader inicial
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
  const isInitialLoadRef = useRef(true);

  // 🔄 FUNCIÓN PRINCIPAL PARA CARGAR PERSONAL
  const loadPersonal = useCallback(async (newFilters = {}) => {
    if (!mountedRef.current) return;
    
    console.log('📡 [usePersonalCRUD] Cargando personal...');
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
        
        setPersonal(result.data || []);
        setPagination(result.pagination || {
          current_page: updatedFilters.page,
          per_page: updatedFilters.limit,
          total: (result.data || []).length,
          total_pages: Math.ceil((result.data || []).length / updatedFilters.limit) || 1
        });
        
        setFilters(updatedFilters);
        
        // Si es carga inicial, marcar como completada
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
          console.log('✅ [usePersonalCRUD] Carga inicial completada');
        }
      } else {
        throw new Error(result.error || 'Error al cargar el personal');
      }
    } catch (err) {
      console.error('💥 [usePersonalCRUD] Error:', err.message);
      setError(err.message || 'Error al cargar el personal');
      
      // Para debugging, mostrar datos mock si hay error
      if (import.meta.env.DEV) {
        console.log('🔄 [usePersonalCRUD] Usando datos mock para desarrollo');
        setPersonal([
          {
            id: 1,
            legajo: 'P0001',
            nombre: 'Juan',
            apellido: 'Pérez',
            dni: '30123456',
            telefono: '011-1234-5678',
            email: 'juan.perez@empresa.com',
            sector: 'Logística',
            cargo: 'Operador',
            estado: 'Activo',
            fecha_ingreso: '2023-01-15'
          },
          {
            id: 2,
            legajo: 'P0002',
            nombre: 'María',
            apellido: 'Gómez',
            dni: '28987654',
            telefono: '011-8765-4321',
            email: 'maria.gomez@empresa.com',
            sector: 'Administración',
            cargo: 'Supervisora',
            estado: 'Activo',
            fecha_ingreso: '2022-05-20'
          },
          {
            id: 3,
            legajo: 'P0003',
            nombre: 'Carlos',
            apellido: 'Rodríguez',
            dni: '32123456',
            telefono: '011-5555-6666',
            email: 'carlos.rodriguez@empresa.com',
            sector: 'Mantenimiento',
            cargo: 'Técnico',
            estado: 'Inactivo',
            fecha_ingreso: '2021-11-10'
          }
        ]);
        setPagination({
          current_page: 1,
          per_page: 10,
          total: 3,
          total_pages: 1
        });
        setError(null); // Limpiar error para mostrar datos mock
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

  // ➕ CREAR NUEVO PERSONAL
  const handleCreate = useCallback(async (personalData) => {
    setLoading(true);
    
    try {
      console.log('➕ [usePersonalCRUD] Creando personal:', personalData);
      const result = await personalService.createPersonal(personalData);
      
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

  // ✏️ EDITAR PERSONAL
  const handleEdit = useCallback(async (id, personalData) => {
    setLoading(true);
    
    try {
      console.log(`✏️ [usePersonalCRUD] Editando ID: ${id}`, personalData);
      const result = await personalService.updatePersonal(id, personalData);
      
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
        
        // Actualizar lista local
        setPersonal(prev => prev.filter(item => item.id !== id));
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1
        }));
      } else {
        throw new Error(result.error || 'Error al eliminar el personal');
      }
    } catch (err) {
      console.error('💥 [usePersonalCRUD] Error deleting:', err);
      alert('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [deleteModal]);

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
    const active = personal.filter(p => p.estado === 'Activo').length;
    const inactive = personal.filter(p => p.estado === 'Inactivo').length;
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
    setSelectedPerson(person);
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
        Legajo: person.legajo || person.id,
        Nombre: person.nombre,
        Apellido: person.apellido,
        DNI: person.dni,
        Sector: person.sector,
        Cargo: person.cargo || person.puesto,
        Estado: person.estado,
        'Teléfono': person.telefono,
        'Email': person.email,
        'Fecha Ingreso': person.fecha_ingreso
      }));
      
      const headers = Object.keys(dataToExport[0] || {}).join(',');
      const rows = dataToExport.map(row => 
        Object.values(row).map(value => `"${value}"`).join(',')
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

  // 🏁 INICIALIZACIÓN - SOLO UNA VEZ
  useEffect(() => {
    mountedRef.current = true;
    
    // Cargar datos iniciales
    if (isInitialLoadRef.current) {
      console.log('🚀 [usePersonalCRUD] Ejecutando carga inicial');
      loadPersonal();
    }
    
    return () => {
      mountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []); // ✅ DEPENDENCIAS VACÍAS - SOLO UNA VEZ

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