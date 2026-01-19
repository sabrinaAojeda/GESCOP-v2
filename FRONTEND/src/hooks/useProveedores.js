// FRONTEND/src/hooks/useProveedores.js - VERSIÓN ACTUALIZADA
import { useState, useEffect, useRef } from 'react';
import { proveedoresService } from '../services';

let globalLoadStarted = false;

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

  const mountedRef = useRef(true);
  const loadAttemptsRef = useRef(0);
  const initialLoadDoneRef = useRef(false);

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

  const loadProveedores = async (newFilters = {}) => {
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
      const updatedFilters = { 
        ...filters, 
        ...newFilters,
        // Incluir filtro de seguro RT
        tiene_seguro_RT: newFilters.tiene_seguro_RT || ''
      };
      
      HookLogger.info('Cargando proveedores con filtros:', updatedFilters);
      
      const response = await proveedoresService.getProveedores(updatedFilters);
      
      if (mountedRef.current) {
        const { data, pagination: paginationData, filterOptions: options } = procesarRespuestaProveedores(response);
        
        // Procesar datos para el frontend
        const proveedoresProcesados = data.map(prov => ({
          ...prov,
          // Asegurar campos nuevos
          sector_servicio: prov.sector_servicio || prov.rubro || '',
          servicio: prov.servicio || '',
          localidad: prov.localidad || '',
          seguro_RT: prov.seguro_RT !== undefined ? prov.seguro_RT : false,
          seguro_vida: prov.seguro_vida || false,
          habilitacion_personal: prov.habilitacion_personal || '',
          habilitacion_vehiculo: prov.habilitacion_vehiculo || '',
          personal_contratado: prov.personal_contratado || 0,
          documentos: prov.documentos || 0,
          vencimiento_documentacion: prov.vencimiento_documentacion || 
                                     prov.proximo_vencimiento || 
                                     new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
        }));
        
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
        
        // Datos de ejemplo para desarrollo
        if (import.meta.env.DEV) {
          const mockData = [
            {
              id: 'PROV-001',
              codigo: 'PROV-001',
              razon_social: 'Seguridad Total S.A.',
              cuit: '30-12345678-9',
              rubro: 'Servicios de Vigilancia',
              sector_servicio: 'Seguridad',
              servicio: 'Vigilancia de Plantas',
              direccion: 'Av. Siempre Viva 123',
              localidad: 'Capital Federal',
              provincia: 'Buenos Aires',
              telefono: '011-4789-1234',
              email: 'contacto@seguridadtotal.com',
              contacto_nombre: 'Carlos Rodríguez',
              contacto_cargo: 'Gerente Comercial',
              estado: 'Activo',
              seguro_RT: true,
              seguro_vida: true,
              habilitacion_personal: 'Vigente hasta 2024-12-31',
              habilitacion_vehiculo: 'Vigente hasta 2024-11-30',
              personal_contratado: 15,
              documentos: 8,
              vencimiento_documentacion: '2024-06-15'
            }
          ];
          
          setProveedores(mockData);
          setPagination({
            current_page: 1,
            per_page: 10,
            total: mockData.length,
            total_pages: 1
          });
          setError(null);
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Crear proveedor con campos extendidos
  const createProveedor = async (proveedorData) => {
    if (loading) return { success: false, error: 'Ya hay una operación en curso' };
    
    setLoading(true);
    setError(null);
    
    try {
      HookLogger.info('Creando proveedor:', proveedorData);
      
      // Preparar datos para el backend
      const datosParaEnviar = {
        ...proveedorData,
        // Asegurar campos booleanos
        seguro_RT: Boolean(proveedorData.seguro_RT),
        seguro_vida: Boolean(proveedorData.seguro_vida),
        // Generar código si no existe
        codigo: proveedorData.codigo || `PROV-${Date.now().toString().slice(-6)}`
      };
      
      const resultado = await proveedoresService.createProveedor(datosParaEnviar);
      
      if (resultado.success) {
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
      
      const datosParaEnviar = {
        id,
        ...proveedorData,
        seguro_RT: Boolean(proveedorData.seguro_RT),
        seguro_vida: Boolean(proveedorData.seguro_vida)
      };
      
      const resultado = await proveedoresService.updateProveedor(id, datosParaEnviar);
      
      if (resultado.success) {
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

  // Filtros específicos
  const handleSearch = (searchTerm) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ search: searchTerm, page: 1 });
    }
  };

  const handleRubroFilter = (rubro) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ rubro, page: 1 });
    }
  };

  const handleSectorServicioFilter = (sector) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ sector_servicio: sector, page: 1 });
    }
  };

  const handleEstadoFilter = (estado) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ estado, page: 1 });
    }
  };

  const handleLocalidadFilter = (localidad) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ localidad, page: 1 });
    }
  };

  const handleSeguroRTFilter = (tieneSeguro) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ tiene_seguro_RT: tieneSeguro, page: 1 });
    }
  };

  const resetFilters = () => {
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
  };

  const handlePageChange = (newPage) => {
    if (!loading && loadAttemptsRef.current < 3) {
      loadProveedores({ page: newPage });
    }
  };

  // Exportar con campos extendidos
  const exportToCSV = () => {
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
  };

  // Carga inicial
  useEffect(() => {
    mountedRef.current = true;
    loadAttemptsRef.current = 0;

    if (globalLoadStarted || initialLoadDoneRef.current) {
      HookLogger.debug('Carga inicial bloqueada: ya se ejecutó globalmente');
      return;
    }

    globalLoadStarted = true;
    initialLoadDoneRef.current = true;

    HookLogger.info('INICIANDO CARGA INICIAL ÚNICA DE PROVEEDORES');

    const timer = setTimeout(() => {
      if (mountedRef.current) {
        loadProveedores();
      }
    }, 200);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      
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
    handleSectorServicioFilter,
    handleEstadoFilter,
    handleLocalidadFilter,
    handleSeguroRTFilter,
    resetFilters,
    exportToCSV
  };
};