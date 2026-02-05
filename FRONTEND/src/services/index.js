// src/services/index.js - VERSIÓN CORREGIDA CON DEFAULT IMPORTS
import api from './api';
import personalService from './personalService';
import dashboardService from './dashboardService';
import alertasService from './alertasService';
import vehiculoService from './vehiculoService';
import proveedoresService from './proveedoresService';
import sedesService from './sedesService';
import documentosService from './documentosService';
import equipamientoService from './equipamientoService';
import vehiculosVendidosService from './vehiculosVendidosService';
import configuracionService from './configuracionService';
import reportesService from './reportesService';

// Exportar todos los servicios
export {
  api,
  personalService,
  dashboardService,
  alertasService,
  vehiculoService,
  proveedoresService,
  sedesService,
  documentosService,
  equipamientoService,
  vehiculosVendidosService,
  configuracionService,
  reportesService
};

// Servicio para probar conexión API
export const testAPI = async () => {
  try {
    const response = await api.get('/test');
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
  dashboardService,
  alertasService,
  vehiculoService,
  proveedoresService,
  sedesService,
  documentosService,
  equipamientoService,
  vehiculosVendidosService,
  configuracionService,
  reportesService,
  testAPI,
  testPersonalConnection
};
