// src/services/api.js - VERSIÓN ADAPTADA A TU BACKEND
import axios from 'axios';

// 🎯 URL BASE CORRECTA para tu estructura
const API_URL = 'https://gescop.vexy.host'; // Sin /api al final

// Crear instancia de axios con configuración optimizada
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 15000,
  withCredentials: false
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Debugging detallado
    const method = config.method?.toUpperCase();
    const url = config.baseURL + config.url;
    const params = config.params || {};
    
    console.group(`🚀 [API REQUEST] ${method} ${url}`);
    console.log('Params:', params);
    console.log('Data:', config.data);
    console.groupEnd();
    
    // Evitar caché para GET requests
    if (method === 'GET') {
      config.params = {
        ...params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [API] Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    const url = response.config.url;
    const status = response.status;
    
    console.log(`✅ [API] Response ${status}: ${url}`);
    
    // Si la respuesta tiene formato incorrecto, normalizarla
    if (response.data && typeof response.data === 'string') {
      try {
        response.data = JSON.parse(response.data);
      } catch (e) {
        // Si no es JSON válido, crear estructura estándar
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
    const url = error.config?.url || 'unknown';
    const status = error.response?.status;
    const message = error.message;
    
    console.group(`❌ [API ERROR] ${url}`);
    console.log('Status:', status);
    console.log('Message:', message);
    console.log('Response:', error.response?.data);
    console.log('Full Error:', error);
    console.groupEnd();
    
    // Crear error amigable
    let userMessage = 'Error de conexión';
    
    if (error.code === 'ECONNABORTED') {
      userMessage = 'Tiempo de espera agotado. El servidor está tardando demasiado.';
    } else if (message.includes('Network')) {
      userMessage = 'Error de red. Verifique su conexión a internet.';
    } else if (status === 404) {
      userMessage = 'Recurso no encontrado.';
    } else if (status === 500) {
      userMessage = 'Error interno del servidor.';
    } else if (error.response?.data?.error) {
      userMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      userMessage = error.response.data.message;
    }
    
    // Crear error estructurado
    const structuredError = new Error(userMessage);
    structuredError.status = status;
    structuredError.original = error;
    structuredError.response = error.response?.data;
    
    return Promise.reject(structuredError);
  }
);

// Función para debug del API
export const debugAPI = () => {
  console.log('🔧 [API DEBUG] Configuración:', {
    baseURL: api.defaults.baseURL,
    timeout: api.defaults.timeout,
    headers: api.defaults.headers.common
  });
  
  // Probar conexión básica
  return api.get('/api/test')
    .then(response => {
      console.log('✅ API Conectado:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('❌ API No disponible:', error.message);
      return { success: false, error: error.message };
    });
};

export default api;