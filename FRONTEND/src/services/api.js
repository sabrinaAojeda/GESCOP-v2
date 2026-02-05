// FRONTEND/src/services/api.js - VERSIÓN CORREGIDA CON /api
import axios from 'axios';

// 🎯 URL BASE - Lee de variable de entorno o usa valor por defecto
const API_URL = import.meta.env.VITE_API_URL || 'https://gescop.vexy.host/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 30000, // 30 segundos timeout
  withCredentials: false
});

// 🎯 INTERCEPTOR DE REQUEST CON LOGGING MEJORADO
api.interceptors.request.use(
  (config) => {
    const method = config.method?.toUpperCase();
    const url = config.url;
    const fullUrl = config.baseURL + url;
    
    console.group(`🚀 [API REQUEST] ${method} ${url}`);
    console.log('URL Completa:', fullUrl);
    console.log('Parámetros:', config.params || 'Sin parámetros');
    console.log('Datos:', config.data || 'Sin datos');
    console.groupEnd();
    
    // Añadir timestamp para evitar caché
    if (method === 'GET' && config.params) {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// 🎯 INTERCEPTOR DE RESPONSE CON MANEJO DE ERRORES MEJORADO
api.interceptors.response.use(
  (response) => {
    const url = response.config.url;
    const status = response.status;
    
    console.log(`✅ [API RESPONSE ${status}] ${url}`);
    
    // Validar que la respuesta sea JSON válido
    if (response.data && typeof response.data === 'string') {
      try {
        response.data = JSON.parse(response.data);
      } catch (e) {
        console.warn(`⚠️ [API] Respuesta no es JSON válido:`, response.data);
        response.data = {
          success: true,
          message: response.data,
          data: response.data
        };
      }
    }
    
    return response;
  },
  (error) => {
    const url = error.config?.url || 'Desconocido';
    const status = error.response?.status;
    const message = error.message;
    
    console.group(`❌ [API ERROR] ${url}`);
    console.log('Estado:', status);
    console.log('Mensaje:', message);
    console.log('Respuesta:', error.response?.data);
    console.log('Error completo:', error);
    console.groupEnd();
    
    // 🎯 CREAR ERROR ESTRUCTURADO
    const structuredError = {
      message: '',
      status: status,
      original: error,
      data: error.response?.data
    };
    
    if (error.code === 'ECONNABORTED') {
      structuredError.message = 'Tiempo de espera agotado. El servidor está tardando demasiado.';
    } else if (message.includes('Network Error')) {
      structuredError.message = 'Error de red. Verifique su conexión a internet.';
    } else if (status === 404) {
      structuredError.message = 'Recurso no encontrado.';
    } else if (status === 500) {
      structuredError.message = 'Error interno del servidor.';
    } else if (error.response?.data?.message) {
      structuredError.message = error.response.data.message;
    } else if (error.response?.data?.error) {
      structuredError.message = error.response.data.error;
    } else {
      structuredError.message = 'Error de conexión con el servidor.';
    }
    
    throw new Error(structuredError.message);
  }
);

// 🎯 FUNCIÓN PARA TESTEAR CONEXIÓN
export const testAPIConnection = async () => {
  console.log('🔧 [API TEST] Probando conexión...');
  
  try {
    const response = await api.get('/test');
    console.log('✅ [API TEST] Conexión exitosa:', response.data);
    return {
      success: true,
      data: response.data,
      message: 'API conectado correctamente'
    };
  } catch (error) {
    console.error('❌ [API TEST] Error de conexión:', error.message);
    
    // Intentar conexión directa
    try {
      const directTest = await axios.get('https://gescop.vexy.host/api/test', {
        timeout: 5000
      });
      console.log('✅ [API DIRECT TEST] Conexión directa exitosa');
      return {
        success: true,
        data: directTest.data,
        message: 'API conectado (prueba directa)'
      };
    } catch (directError) {
      return {
        success: false,
        error: directError.message,
        message: 'No se pudo conectar al API. Verifique: 1) URL correcta, 2) Servidor activo, 3) CORS configurado.'
      };
    }
  }
};

export default api;