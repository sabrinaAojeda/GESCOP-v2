// FRONTEND/src/hooks/useProveedores.js - VERSIÓN CORREGIDA CON IMPORTACIÓN ESTANDARIZADA
import { useState, useEffect, useRef } from 'react';
import { proveedoresService } from '../services'; // Importar desde el index unificado

// VARIABLE GLOBAL - fuera del hook para controlar carga única
let globalLoadStarted = false;

// Logger específico para el hook
const HookLogger = {
  info: (message, data = null) => console.info(`🎯 [useProveedores] ${message}`, data || ''),
  error: (message, data = null) => console.error(`💥 [useProveedores] ${message}`, data || ''),
  debug: (message, data = null) => console.log(`🔧 [useProveedores] ${message}`, data || '')
};

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    rubro: '',
    estado: '',
    localidad: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0
  });
  const [filterOptions, setFilterOptions] = useState({
    rubros: ['Todos los rubros'],
    localidades: ['Todas las localidades'],
    estados: ['Todos los estados']
  });

  // Refs para controlar estado que no causa re-render
  const mountedRef = useRef(true);
  const loadAttemptsRef = useRef(0);
  const initialLoadDoneRef = useRef(false);

  // Función para procesar respuesta del backend
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

  // Cargar proveedores
  const loadProveedores = async (newFilters = {}) => {
    // PROTECCIÓN MÁXIMA CONTRA BUCLE
    if (loading) {
      HookLogger.debug('Load bloqueado: ya está cargando');
      return;
    }

    if (loadAttemptsRef.current >= 2) {
      HookLogger.debug('Load bloqueado: máximo de intentos alcanzado');
      return;
    }

    loadAttemptsRef.current++;
    HookLogger.debug(`Intento de carga #${loadAttemptsRef.current}`);

    setLoading(true);
    setError(null);
    
    try {
      const updatedFilters = { ...filters, ...newFilters };
      HookLogger.info('Cargando proveedores con filtros:', updatedFilters);
      
      const response = await proveedoresService.getProveedores(updatedFilters);
      
      if (mountedRef.current) {
        const { data, pagination: paginationData, filterOptions: options } = procesarRespuestaProveedores(response);
        
        setProveedores(data);
        setPagination(paginationData || pagination);
        setFilters(updatedFilters);
        if (options) setFilterOptions(options);
        HookLogger.info(`Proveedores cargados exitosamente: ${data.length} registros`);
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
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Crear proveedor
  const createProveedor = async (proveedorData) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };
    
    setLoading(true);
    setError(null);
    
    try {
      HookLogger.info('Creando proveedor:', proveedorData);
      const resultado = await proveedoresService.createProveedor(proveedorData);
      
      if (resultado.success) {
        // Recargar después de crear (pero con protección)
        if (loadAttemptsRef.current < 3) {
          await loadProveedores();
        }
        HookLogger.info('Proveedor creado exitosamente');
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
  };

  // Actualizar proveedor
  const updateProveedor = async (id, proveedorData) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };
    
    setLoading(true);
    setError(null);
    
    try {
      HookLogger.info(`Actualizando proveedor ID: ${id}`, proveedorData);
      const resultado = await proveedoresService.updateProveedor(id, proveedorData);
      
      if (resultado.success) {
        // Recargar después de actualizar (perto con protección)
        if (loadAttemptsRef.current < 3) {
          await loadProveedores();
        }
        HookLogger.info('Proveedor actualizado exitosamente');
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
  };

  // Eliminar proveedor
  const deleteProveedor = async (id) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };
    
    setLoading(true);
    setError(null);
    
    try {
      HookLogger.info(`Eliminando proveedor ID: ${id}`);
      const resultado = await proveedoresService.deleteProveedor(id);
      
      if (resultado.success) {
        // Recargar después de eliminar (perto con protección)
        if (loadAttemptsRef.current < 3) {
          await loadProveedores();
        }
        HookLogger.info('Proveedor eliminado exitosamente');
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
  };

  // Cambiar página
  const handlePageChange = (newPage) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ page: newPage });
    }
  };

  // Buscar proveedores
  const handleSearch = (searchTerm) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ search: searchTerm, page: 1 });
    }
  };

  // Filtrar por rubro
  const handleRubroFilter = (rubro) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ rubro, page: 1 });
    }
  };

  // Filtrar por estado
  const handleEstadoFilter = (estado) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ estado, page: 1 });
    }
  };

  // Filtrar por localidad
  const handleLocalidadFilter = (localidad) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ localidad, page: 1 });
    }
  };

  // Resetear filtros
  const resetFilters = () => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ 
        page: 1, 
        search: '', 
        rubro: '', 
        estado: '', 
        localidad: '' 
      });
    }
  };

  // Exportar a CSV
  const exportToCSV = () => {
    if (!proveedores.length) return;
    
    const headers = [
      'Código',
      'Razón Social', 
      'CUIT',
      'Rubro',
      'Dirección',
      'Localidad',
      'Provincia',
      'Teléfono',
      'Email',
      'Contacto',
      'Cargo Contacto',
      'Estado',
      'Seguro RT',
      'Habilitación Personal',
      'Habilitación Vehículo'
    ];
    
    const csvRows = [
      headers.join(','),
      ...proveedores.map(prov => [
        `"${prov.codigo || ''}"`,
        `"${prov.razon_social || ''}"`,
        `"${prov.cuit || ''}"`,
        `"${prov.rubro || ''}"`,
        `"${prov.direccion || ''}"`,
        `"${prov.localidad || ''}"`,
        `"${prov.provincia || ''}"`,
        `"${prov.telefono || ''}"`,
        `"${prov.email || ''}"`,
        `"${prov.contacto_nombre || ''}"`,
        `"${prov.contacto_cargo || ''}"`,
        `"${prov.estado || ''}"`,
        prov.seguro_RT ? 'Sí' : 'No',
        `"${prov.habilitacion_personal || ''}"`,
        `"${prov.habilitacion_vehiculo || ''}"`
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
  };

  // Cargar datos iniciales - CON PROTECCIÓN MÁXIMA
  useEffect(() => {
    mountedRef.current = true;
    loadAttemptsRef.current = 0;

    // PROTECCIÓN GLOBAL + LOCAL - Evitar múltiples cargas
    if (globalLoadStarted || initialLoadDoneRef.current) {
      HookLogger.debug('Carga inicial bloqueada: ya se ejecutó globalmente');
      return;
    }

    // MARCAR como cargado a nivel global y local
    globalLoadStarted = true;
    initialLoadDoneRef.current = true;

    HookLogger.info('INICIANDO CARGA INICIAL ÚNICA DE PROVEEDORES');

    // Pequeño delay para asegurar que el componente está completamente montado
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        loadProveedores();
      }
    }, 200);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      
      // Resetear la protección global después de un tiempo
      setTimeout(() => {
        globalLoadStarted = false;
        HookLogger.debug('Protección global reseteada para proveedores');
      }, 3000);
    };
  }, []);

  return {
    proveedores,
    loading,
    error,
    filters,
    pagination,
    filterOptions,
    loadProveedores,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    handlePageChange,
    handleSearch,
    handleRubroFilter,
    handleEstadoFilter,
    handleLocalidadFilter,
    resetFilters,
    exportToCSV
  };
};