// src/hooks/usePersonal.js - VERSIÓN SIMPLIFICADA (solo si es necesario)
import personalService from '../services/personalService';

export const usePersonal = () => {
  // Si otras partes del código usan este hook, redirigir a usePersonalCRUD
  console.warn('⚠️ usePersonal está obsoleto. Usa usePersonalCRUD en su lugar.');
  
  // Función de compatibilidad
  const loadPersonal = async (params) => {
    try {
      const result = await personalService.getPersonal(params);
      return result;
    } catch (error) {
      throw error;
    }
  };
  
  return { loadPersonal };
};