// src/utils/fieldMapping.js - UTILIDAD DE MAPEO DE CAMPOS FRONTEND-BACKEND
// Esta utilidad proporciona mapeo consistente entre nombres de campos amigables del frontend
// y nombres de campos de la base de datos/backend

import { useState, useEffect } from 'react'

// Mapeo por módulo/entity
export const FIELD_MAPPINGS = {
  // === PROVEEDORES ===
  proveedor: {
    frontendToBackend: {
      email_corporativo: 'correo_corporativo',
      seguro_vida: 'seguro_vida_personal',
      cargo: 'puesto',
      rol: 'rol_sistema'
    },
    backendToFrontend: {
      correo_corporativo: 'email_corporativo',
      seguro_vida_personal: 'seguro_vida',
      puesto: 'cargo',
      rol_sistema: 'rol'
    }
  },

  // === PERSONAL ===
  personal: {
    frontendToBackend: {
      email_corporativo: 'correo_corporativo',
      cargo: 'puesto',
      rol: 'rol_sistema',
      licencia_conducir: 'estado_licencia',
      categoria_licencia: 'clase_licencia'
    },
    backendToFrontend: {
      correo_corporativo: 'email_corporativo',
      puesto: 'cargo',
      rol_sistema: 'rol',
      estado_licencia: 'licencia_conducir',
      clase_licencia: 'categoria_licencia'
    }
  },

  // === SEDES ===
  sede: {
    frontendToBackend: {
      tipo_predio: 'tipo',
      servicio_principal: 'tipo_habilitacion'
    },
    backendToFrontend: {
      tipo: 'tipo_predio',
      tipo_habilitacion: 'servicio_principal'
    }
  },

  // === VEHÍCULOS ===
  vehiculo: {
    frontendToBackend: {},
    backendToFrontend: {}
  }
}

/**
 * Convierte campos de frontend a nombres de backend
 * @param {Object} data - Datos con nombres de campos de frontend
 * @param {string} entity - Nombre de la entidad (proveedor, personal, sede, vehiculo)
 * @returns {Object} - Datos con nombres de campos de backend
 */
export function frontendToBackend(data, entity) {
  const mapping = FIELD_MAPPINGS[entity]?.frontendToBackend || {}
  
  const result = { ...data }
  
  Object.keys(mapping).forEach(frontendField => {
    if (result.hasOwnProperty(frontendField)) {
      const backendField = mapping[frontendField]
      result[backendField] = result[frontendField]
      delete result[frontendField]
    }
  })
  
  return result
}

/**
 * Convierte campos de backend a nombres de frontend
 * @param {Object} data - Datos con nombres de campos de backend
 * @param {string} entity - Nombre de la entidad (proveedor, personal, sede, vehiculo)
 * @returns {Object} - Datos con nombres de campos de frontend
 */
export function backendToFrontend(data, entity) {
  const mapping = FIELD_MAPPINGS[entity]?.backendToFrontend || {}
  
  const result = { ...data }
  
  Object.keys(mapping).forEach(backendField => {
    if (result.hasOwnProperty(backendField)) {
      const frontendField = mapping[backendField]
      result[frontendField] = result[backendField]
      delete result[backendField]
    }
  })
  
  return result
}

/**
 * Hook personalizado para usar mapeo de campos en formularios
 * @param {Object} initialData - Datos iniciales
 * @param {string} entity - Nombre de la entidad
 * @returns {Object} - Funciones y datos para manejar el formulario
 */
export function useFieldMapping(initialData = {}, entity) {
  const [data, setData] = useState(initialData)

  // Convertir datos al cargar (backend -> frontend)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const converted = backendToFrontend(initialData, entity)
      setData(converted)
    }
  }, [initialData, entity])

  // Convertir al enviar (frontend -> backend)
  const getBackendData = () => {
    return frontendToBackend(data, entity)
  }

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return {
    formData: data,
    setFormData: setData,
    handleChange,
    getBackendData
  }
}

export default {
  FIELD_MAPPINGS,
  frontendToBackend,
  backendToFrontend,
  useFieldMapping
}
