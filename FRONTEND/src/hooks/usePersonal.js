// src/hooks/usePersonal.js - VERSIÓN CORREGIDA CON IMPORTACIÓN ESTANDARIZADA
import { useState, useEffect, useRef } from 'react';
import { personalService } from '../services'; // Importar desde el index unificado

// VARIABLE GLOBAL - fuera del hook para controlar carga única
let globalLoadStarted = false;

// Logger específico para el hook
const HookLogger = {
  info: (message, data = null) => console.info(`🎯 [usePersonal] ${message}`, data || ''),
  error: (message, data = null) => console.error(`💥 [usePersonal] ${message}`, data || ''),
  debug: (message, data = null) => console.log(`🔧 [usePersonal] ${message}`, data || '')
};

export const usePersonal = () => {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    sector: '',
    estado: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0
  });

  // Refs para controlar estado que no causa re-render
  const mountedRef = useRef(true);
  const loadAttemptsRef = useRef(0);
  const initialLoadDoneRef = useRef(false);

  // Función para procesar respuesta del backend
  const procesarRespuestaPersonal = (response) => {
    HookLogger.debug('Procesando respuesta del backend', response);
    
    // Manejo consistente con vehiculos
    if (response.success !== undefined && response.data) {
      // Formato: { success: true, data: [], pagination: {} }
      return {
        data: response.data.personal || response.data || [],
        pagination: response.data.pagination || response.pagination
      };
    } else if (response.data) {
      // Formato: { data: [] }
      return {
        data: response.data.personal || response.data || [],
        pagination: response.pagination
      };
    } else {
      HookLogger.warn('Formato de respuesta inesperado', response);
      return { data: [], pagination: {} };
    }
  };

  // Cargar personal
  const loadPersonal = async (newFilters = {}) => {
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
      HookLogger.info('Cargando personal con filtros:', updatedFilters);
      
      const response = await personalService.getPersonal(updatedFilters);
      
      if (mountedRef.current) {
        const { data, pagination: paginationData } = procesarRespuestaPersonal(response);
        
        setPersonal(data);
        setPagination(paginationData || pagination);
        setFilters(updatedFilters);
        HookLogger.info(`Personal cargado exitosamente: ${data.length} registros`);
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMsg = err.response?.data?.message || 'Error al cargar el personal';
        setError(errorMsg);
        HookLogger.error('Error loading personal:', {
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

  // Crear personal
  const createPersonal = async (personalData) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };
    
    setLoading(true);
    setError(null);
    
    try {
      HookLogger.info('Creando personal:', personalData);
      const resultado = await personalService.createPersonal(personalData);
      
      if (resultado.success) {
        // Recargar después de crear (pero con protección)
        if (loadAttemptsRef.current < 3) {
          await loadPersonal();
        }
        HookLogger.info('Personal creado exitosamente');
        return { success: true };
      } else {
        const errorMsg = resultado.message || 'Error al crear el personal';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al crear el personal';
      HookLogger.error('Error al crear personal:', {
        error: err.message,
        status: err.response?.status
      });
      
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar personal
  const updatePersonal = async (id, personalData) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };
    
    setLoading(true);
    setError(null);
    
    try {
      HookLogger.info(`Actualizando personal ID: ${id}`, personalData);
      const resultado = await personalService.updatePersonal(id, personalData);
      
      if (resultado.success) {
        // Recargar después de actualizar (pero con protección)
        if (loadAttemptsRef.current < 3) {
          await loadPersonal();
        }
        HookLogger.info('Personal actualizado exitosamente');
        return { success: true };
      } else {
        const errorMsg = resultado.message || 'Error al actualizar el personal';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al actualizar el personal';
      HookLogger.error('Error al actualizar personal:', {
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

  // Eliminar personal
  const deletePersonal = async (id) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };
    
    setLoading(true);
    setError(null);
    
    try {
      HookLogger.info(`Eliminando personal ID: ${id}`);
      const resultado = await personalService.deletePersonal(id);
      
      if (resultado.success) {
        // Recargar después de eliminar (pero con protección)
        if (loadAttemptsRef.current < 3) {
          await loadPersonal();
        }
        HookLogger.info('Personal eliminado exitosamente');
        return { success: true };
      } else {
        const errorMsg = resultado.message || 'Error al eliminar el personal';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al eliminar el personal';
      HookLogger.error('Error al eliminar personal:', {
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
      loadPersonal({ page: newPage });
    }
  };

  // Buscar personal
  const handleSearch = (searchTerm) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadPersonal({ search: searchTerm, page: 1 });
    }
  };

  // Filtrar por sector
  const handleSectorFilter = (sector) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadPersonal({ sector, page: 1 });
    }
  };

  // Filtrar por estado
  const handleEstadoFilter = (estado) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadPersonal({ estado, page: 1 });
    }
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

    HookLogger.info('INICIANDO CARGA INICIAL ÚNICA');

    // Pequeño delay para asegurar que el componente está completamente montado
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        loadPersonal();
      }
    }, 200);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      
      // Resetear la protección global después de un tiempo (cuando el componente se desmonta)
      setTimeout(() => {
        globalLoadStarted = false;
        HookLogger.debug('Protección global reseteada');
      }, 3000);
    };
  }, []);

  return {
    personal,
    loading,
    error,
    filters,
    pagination,
    loadPersonal,
    createPersonal,
    updatePersonal,
    deletePersonal,
    handlePageChange,
    handleSearch,
    handleSectorFilter,
    handleEstadoFilter
  };
};