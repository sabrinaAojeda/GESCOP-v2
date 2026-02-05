// src/services/personalService.js - VERSIÓN COMPLETA CON TODOS LOS CAMPOS
import api from './api';

const LOG_LEVEL = {
  ERROR: 0,
  WARN: 1, 
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LOG_LEVEL = import.meta.env.VITE_ENV === 'production' ? LOG_LEVEL.WARN : LOG_LEVEL.DEBUG;

class PersonalLogger {
  static error(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.ERROR) {
      console.error(`❌ [PERSONAL_SERVICE] ${message}`, data || '');
    }
  }

  static warn(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.WARN) {
      console.warn(`⚠️ [PERSONAL_SERVICE] ${message}`, data || '');
    }
  }

  static info(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.INFO) {
      console.info(`ℹ️ [PERSONAL_SERVICE] ${message}`, data || '');
    }
  }

  static debug(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.DEBUG) {
      console.log(`🔍 [PERSONAL_SERVICE] ${message}`, data || '');
    }
  }
}

const personalService = {
  // 🎯 OBTENER PERSONAL CON FILTROS
  getPersonal: async (params = {}) => {
    try {
      PersonalLogger.info(`Solicitando personal con filtros:`, params);
      
      // Construir parámetros de consulta
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.search && { search: params.search }),
        ...(params.sector && { sector: params.sector }),
        ...(params.estado && { estado: params.estado }),
        ...(params.id && { id: params.id })
      };

      // Llamada al endpoint del backend REAL
      const response = await api.get('/personal', { params: queryParams });
      
      PersonalLogger.debug(`Respuesta recibida:`, response.data);
      
      // Procesar respuesta del backend
      if (response.data && response.data.success !== false) {
        // Si la respuesta tiene estructura { data: [...], pagination: {...} }
        if (response.data.data) {
          PersonalLogger.info(`✅ Personal obtenido: ${response.data.data.length} registros`);
          return {
            success: true,
            data: response.data.data,
            pagination: response.data.pagination || {
              current_page: queryParams.page,
              per_page: queryParams.limit,
              total: response.data.data.length,
              total_pages: Math.ceil(response.data.data.length / queryParams.limit) || 1
            }
          };
        }
          
        // Si solo es un array directo
        if (Array.isArray(response.data)) {
          PersonalLogger.info(`✅ Personal obtenido: ${response.data.length} registros`);
          return {
            success: true,
            data: response.data,
            pagination: {
              current_page: queryParams.page,
              per_page: queryParams.limit,
              total: response.data.length,
              total_pages: Math.ceil(response.data.length / queryParams.limit) || 1
            }
          };
        }
          
        // Si solo es un objeto individual
        PersonalLogger.info(`✅ Personal obtenido: objeto individual`);
        return {
          success: true,
          data: [response.data]
        };
      } else {
        const errorMsg = response.data?.error || response.data?.message || 'Error en la respuesta del servidor';
        PersonalLogger.warn('Error en respuesta:', errorMsg);
        throw new Error(errorMsg);
      }
      
    } catch (error) {
      PersonalLogger.error('Error en getPersonal', {
        endpoint: '/personal',
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Crear respuesta de error amigable
      let errorMessage = 'Error al cargar el personal';
      
      if (error.response?.status === 404) {
        errorMessage = 'Endpoint no encontrado. Verifica la configuración del servidor.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet o la configuración CORS.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // 🎯 BUSCAR PERSONAL RÁPIDO
  searchPersonal: async (searchTerm, limit = 10) => {
    try {
      PersonalLogger.debug(`Buscando personal: "${searchTerm}"`);
      
      const response = await api.get('/personal/search', {
        params: { q: searchTerm, limit }
      });
      
      PersonalLogger.info(`✅ Búsqueda completada: ${response.data?.length || 0} resultados`);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      PersonalLogger.error('Error en searchPersonal:', {
        searchTerm,
        error: error.message
      });
      throw error;
    }
  },

  // 🎯 CREAR NUEVO PERSONAL CON TODOS LOS CAMPOS
  createPersonal: async (personalData) => {
    try {
      PersonalLogger.info('Creando nuevo personal con campos completos:', personalData);
      
      // Preparar datos completos para el backend
      const dataToSend = {
        nombre: personalData.nombre,
        apellido: personalData.apellido,
        dni: personalData.dni,
        cuil: personalData.cuil || '',
        legajo: personalData.legajo || '',
        telefono: personalData.telefono || '',
        email: personalData.email || '',
        correo_corporativo: personalData.correo_corporativo || '',
        puesto: personalData.puesto || personalData.cargo || '',
        sector: personalData.sector || '',
        rol_sistema: personalData.rol_sistema || personalData.rol || 'usuario',
        fecha_ingreso: personalData.fecha_ingreso || new Date().toISOString().split('T')[0],
        fecha_nacimiento: personalData.fecha_nacimiento || '',
        direccion: personalData.direccion || '',
        tipo_contrato: personalData.tipo_contrato || 'Planta Permanente',
        estado_licencia: personalData.estado_licencia || '',
        clase_licencia: personalData.clase_licencia || personalData.categoria_licencia || '',
        vencimiento_licencia: personalData.vencimiento_licencia || '',
        certificados: personalData.certificados || personalData.certificados_capacitacion || '',
        carnet_cargas_peligrosas: personalData.carnet_cargas_peligrosas || '',
        vencimiento_carnet: personalData.vencimiento_carnet || '',
        observaciones: personalData.observaciones || '',
        activo: personalData.activo !== undefined ? personalData.activo : 1
      };
      
      PersonalLogger.debug('Datos enviados al backend:', dataToSend);
      
      const response = await api.post('/personal/create', dataToSend);
      
      if (response.data?.success || response.status === 201) {
        const successMessage = response.data?.message || 'Personal creado exitosamente';
        PersonalLogger.info('✅ Personal creado exitosamente', { 
          message: successMessage,
          id: response.data?.id 
        });
        
        return {
          success: true,
          message: successMessage,
          id: response.data?.id
        };
      } else {
        const errorMsg = response.data?.message || response.data?.error || 'Error al crear el personal';
        PersonalLogger.warn('Error en respuesta al crear personal', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      PersonalLogger.error('Error creando personal:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Error al crear el personal';
      
      if (error.response?.status === 409) {
        errorMessage = 'Ya existe personal con ese DNI o legajo';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // 🎯 ACTUALIZAR PERSONAL CON TODOS LOS CAMPOS
  updatePersonal: async (id, personalData) => {
    try {
      PersonalLogger.info(`Actualizando personal ID: ${id}`, personalData);
      
      // Preparar datos completos para el backend
      const dataToSend = {
        id: id,
        nombre: personalData.nombre,
        apellido: personalData.apellido,
        dni: personalData.dni,
        cuil: personalData.cuil || '',
        legajo: personalData.legajo || '',
        telefono: personalData.telefono || '',
        email: personalData.email || '',
        correo_corporativo: personalData.correo_corporativo || '',
        puesto: personalData.puesto || personalData.cargo || '',
        sector: personalData.sector || '',
        rol_sistema: personalData.rol_sistema || personalData.rol || 'usuario',
        fecha_ingreso: personalData.fecha_ingreso || '',
        fecha_nacimiento: personalData.fecha_nacimiento || '',
        direccion: personalData.direccion || '',
        tipo_contrato: personalData.tipo_contrato || '',
        estado_licencia: personalData.estado_licencia || '',
        clase_licencia: personalData.clase_licencia || personalData.categoria_licencia || '',
        vencimiento_licencia: personalData.vencimiento_licencia || '',
        certificados: personalData.certificados || personalData.certificados_capacitacion || '',
        carnet_cargas_peligrosas: personalData.carnet_cargas_peligrosas || '',
        vencimiento_carnet: personalData.vencimiento_carnet || '',
        observaciones: personalData.observaciones || '',
        activo: personalData.activo !== undefined ? personalData.activo : 1
      };
      
      const response = await api.put('/personal/update', dataToSend);
      
      if (response.data?.success || response.status === 200) {
        const successMessage = response.data?.message || 'Personal actualizado exitosamente';
        PersonalLogger.info('✅ Personal actualizado exitosamente', { id, message: successMessage });
        
        return {
          success: true,
          message: successMessage
        };
      } else {
        const errorMsg = response.data?.message || response.data?.error || 'Error al actualizar el personal';
        PersonalLogger.warn('Error al actualizar personal', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      PersonalLogger.error('Error actualizando personal:', {
        id,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         'Error al actualizar el personal';
      
      throw new Error(errorMessage);
    }
  },

  // 🎯 ELIMINAR PERSONAL
  deletePersonal: async (id) => {
    try {
      PersonalLogger.info(`Eliminando personal ID: ${id}`);
      
      const response = await api.delete('/personal/delete', { 
        data: { id: id }
      });
      
      if (response.data?.success || response.status === 200) {
        const successMessage = response.data?.message || 'Personal eliminado exitosamente';
        PersonalLogger.info('✅ Personal eliminado exitosamente', { id, message: successMessage });
        
        return {
          success: true,
          message: successMessage
        };
      } else {
        const errorMsg = response.data?.message || response.data?.error || 'Error al eliminar el personal';
        PersonalLogger.warn('Error al eliminar personal', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      PersonalLogger.error('Error eliminando personal:', {
        id,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'No se puede eliminar el personal';
      
      if (error.response?.status === 404) {
        errorMessage = 'Personal no encontrado';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // 🎯 SUBIR DOCUMENTO DE PERSONAL
  uploadDocument: async (personalId, file, tipo = 'general') => {
    try {
      PersonalLogger.info(`Subiendo documento para personal ID: ${personalId}`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      const formData = new FormData();
      formData.append('personal_id', personalId);
      formData.append('tipo', tipo);
      formData.append('archivo', file);
      formData.append('descripcion', file.name);
      
      const response = await api.post('/documentos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data?.success || response.status === 200) {
        PersonalLogger.info('✅ Documento subido exitosamente');
        return {
          success: true,
          message: response.data?.message || 'Documento subido exitosamente',
          documento: response.data?.documento
        };
      } else {
        throw new Error(response.data?.message || 'Error al subir el documento');
      }
    } catch (error) {
      PersonalLogger.error('Error subiendo documento:', {
        personalId,
        error: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // 🎯 OBTENER DOCUMENTOS DE PERSONAL
  getDocuments: async (personalId) => {
    try {
      PersonalLogger.info(`Obteniendo documentos para personal ID: ${personalId}`);
      
      const response = await api.get('/documentos', {
        params: { personal_id: personalId }
      });
      
      PersonalLogger.debug(`Documentos obtenidos: ${response.data?.length || 0}`);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      PersonalLogger.error('Error obteniendo documentos:', {
        personalId,
        error: error.message
      });
      throw error;
    }
  },

  // 🎯 CARGA MASIVA DE PERSONAL
  cargaMasivaPersonal: async (data) => {
    try {
      PersonalLogger.info('Ejecutando carga masiva de personal', { registros: data.length });
      
      const response = await api.post('/personal/carga_masiva_personal', data);
      
      if (response.data?.success) {
        PersonalLogger.info('✅ Carga masiva exitosa', response.data);
        return {
          success: true,
          message: response.data.message,
          resumen: response.data.resumen,
          detalle_errores: response.data.detalle_errores
        };
      } else {
        const errorMsg = response.data?.message || 'Error en carga masiva';
        PersonalLogger.warn('Error en carga masiva:', response.data);
        throw new Error(errorMsg);
      }
    } catch (error) {
      PersonalLogger.error('Error en carga masiva:', {
        error: error.message,
        status: error.response?.status
      });
      throw error;
    }
  }
};

export default personalService;
