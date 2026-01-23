// src/services/index.js - VERSIÓN CORREGIDA
import api from './api';
import { personalService } from './personalService';

// Importar otros servicios solo si existen
let alertasService = null;
let vehiculoService = null;
let proveedoresService = null;

try {
  // Intentar importar servicios existentes
  const alertasModule = await import('./alertasService.js');
  alertasService = alertasModule.alertasService || alertasModule.default || {};
} catch (error) {
  console.warn('⚠️ alertasService.js no encontrado o tiene errores:', error.message);
  alertasService = {
    // Servicio mock básico para evitar errores
    getAlertas: async () => ({ success: false, data: [], message: 'Servicio no disponible' })
  };
}

try {
  const vehiculoModule = await import('./vehiculoService.js');
  vehiculoService = vehiculoModule.vehiculoService || vehiculoModule.default || {};
} catch (error) {
  console.warn('⚠️ vehiculoService.js no encontrado o tiene errores:', error.message);
  vehiculoService = {};
}

try {
  const proveedoresModule = await import('./proveedoresService.js');
  proveedoresService = proveedoresModule.proveedoresService || proveedoresModule.default || {};
} catch (error) {
  console.warn('⚠️ proveedoresService.js no encontrado o tiene errores:', error.message);
  proveedoresService = {};
}

// Servicios disponibles para toda la aplicación
export {
  api,
  personalService,
  alertasService,
  vehiculoService,
  proveedoresService
};

// Servicio para probar conexión API
export const testAPI = async () => {
  try {
    const response = await api.get('/api/test.php');
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error('❌ Error testing API:', error);
    return {
      success: false,
      error: error.message,
      status: error.response?.status
    };
  }
};

// Función para probar conexión personal
export const testPersonalConnection = async () => {
  try {
    const result = await personalService.getPersonal({ limit: 1 });
    return {
      success: true,
      message: 'Conexión personal OK',
      data: result.data || []
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error en conexión personal: ' + error.message
    };
  }
};

// Exportación por defecto para facilitar imports
export default {
  api,
  personalService,
  alertasService,
  vehiculoService,
  proveedoresService,
  testAPI,
  testPersonalConnection
};