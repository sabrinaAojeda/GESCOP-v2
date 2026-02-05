// FRONTEND/src/hooks/useConfiguracion.js - HOOK PARA CONFIGURACIÓN
import { useState, useEffect, useCallback } from 'react';
import configuracionService from '../services/configuracionService';

const useConfiguracion = () => {
  const [configuracion, setConfiguracion] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  // Configuración por defecto
  const defaultConfig = {
    diasVTV: 30,
    diasSeguro: 45,
    diasLicencias: 60,
    diasMantenimiento: 15,
    emailNotificaciones: 'gestiondocumental@copesa-ar.com',
    tiempoSesion: 120,
    intentosLogin: 3,
    tiposHabilitacion: ['Generador', 'Operador', 'Transportista', 'Gestor'],
    basesOperativas: ['Incineración', 'Tratamiento', 'Almacenamiento', 'Logística'],
    reporteSemanalAutomatico: false,
    diaReporteSemanal: 'Lunes',
    mantenerReportesMeses: 12
  };

  // Cargar configuración
  const cargarConfiguracion = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await configuracionService.getConfiguracion();
      
      if (result.success) {
        // Usar configuración del servidor o valores por defecto
        setConfiguracion({ ...defaultConfig, ...result.data });
      } else {
        // Usar valores por defecto si hay error
        setConfiguracion(defaultConfig);
        setError(result.error);
      }
    } catch (err) {
      console.error('Error cargando configuración:', err);
      setConfiguracion(defaultConfig);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Guardar configuración
  const guardarConfiguracion = useCallback(async (nuevaConfig) => {
    setLoading(true);
    setError(null);
    setSaved(false);
    
    try {
      const result = await configuracionService.saveConfiguracion(nuevaConfig);
      
      if (result.success) {
        setConfiguracion({ ...configuracion, ...nuevaConfig });
        setSaved(true);
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error guardando configuración:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [configuracion]);

  // Actualizar campo específico
  const actualizarCampo = useCallback((campo, valor) => {
    setConfiguracion(prev => ({
      ...prev,
      [campo]: valor
    }));
    setSaved(false);
  }, []);

  // Restaurar valores por defecto
  const restaurarDefaults = useCallback(async () => {
    if (window.confirm('¿Estás seguro de restaurar los valores por defecto? Esta acción no se puede deshacer.')) {
      setLoading(true);
      setError(null);
      
      try {
        const result = await configuracionService.restaurarDefaults();
        
        if (result.success) {
          setConfiguracion(defaultConfig);
          setSaved(true);
          return { success: true, message: 'Valores restaurados exitosamente' };
        } else {
          // Si el endpoint no existe, restauramos localmente
          setConfiguracion(defaultConfig);
          setSaved(true);
          return { success: true, message: 'Valores restaurados localmente' };
        }
      } catch (err) {
        console.error('Error restaurando configuración:', err);
        // Restaurar localmente como fallback
        setConfiguracion(defaultConfig);
        setSaved(true);
        return { success: true, message: 'Valores restaurados localmente' };
      } finally {
        setLoading(false);
      }
    }
    return { success: false, message: 'Operación cancelada' };
  }, []);

  // Cargar al montar
  useEffect(() => {
    cargarConfiguracion();
  }, [cargarConfiguracion]);

  return {
    configuracion,
    loading,
    error,
    saved,
    cargarConfiguracion,
    guardarConfiguracion,
    actualizarCampo,
    restaurarDefaults,
    setConfiguracion
  };
};

export default useConfiguracion;
