// src/components/DataTable/forms/SedesForm.jsx
import React, { useState, useEffect } from 'react'
import GenericModal from '../../Common/GenericModal'
import './SedesForm.css'

const SedeForm = ({ mode = 'crear', sede, empresas = [], onClose, onSave }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo_predio: '',
    servicio_principal: '',
    direccion: '',
    localidad: '',
    provincia: 'Buenos Aires',
    telefono: '',
    email: '',
    responsable: '',
    empresa_id: '',
    estado: 'Activa',
    tipo_habilitacion: '',
    habilitacion_numero: '',
    vencimiento_habilitacion: '',
    certificaciones: '',
    seguridad_higiene: '',
    base_madre_copesa: 'No',
    base_operativa: '',
    habilitada: 'Si'
  })

  useEffect(() => {
    if (sede) {
      const mappedData = {
        codigo: sede.codigo || '',
        nombre: sede.nombre || '',
        tipo_predio: sede.tipo || sede.tipo_predio || '',
        servicio_principal: sede.tipo_habilitacion || sede.servicio_principal || '',
        direccion: sede.direccion || '',
        localidad: sede.localidad || '',
        provincia: sede.provincia || 'Buenos Aires',
        telefono: sede.telefono || '',
        email: sede.email || '',
        responsable: sede.responsable || '',
        empresa_id: sede.empresa_id || '',
        estado: sede.estado || 'Activa',
        tipo_habilitacion: sede.tipo_habilitacion || '',
        habilitacion_numero: sede.habilitacion_numero || '',
        vencimiento_habilitacion: sede.vencimiento_habilitacion || '',
        certificaciones: sede.certificaciones || '',
        seguridad_higiene: sede.seguridad_higiene || '',
        base_madre_copesa: sede.base_madre_copesa || 'No',
        base_operativa: sede.base_operativa || '',
        habilitada: sede.habilitada || 'Si'
      }
      setFormData(mappedData)
    }
  }, [sede])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const backendData = {
      codigo: formData.codigo,
      nombre: formData.nombre,
      tipo: formData.tipo_predio,
      direccion: formData.direccion,
      localidad: formData.localidad,
      provincia: formData.provincia,
      telefono: formData.telefono,
      email: formData.email,
      responsable: formData.responsable,
      empresa_id: formData.empresa_id ? parseInt(formData.empresa_id) : null,
      estado: formData.estado,
      tipo_habilitacion: formData.tipo_habilitacion,
      habilitacion_numero: formData.habilitacion_numero,
      vencimiento_habilitacion: formData.vencimiento_habilitacion || null,
      certificaciones: formData.certificaciones,
      seguridad_higiene: formData.seguridad_higiene,
      base_madre_copesa: formData.base_madre_copesa,
      base_operativa: formData.base_operativa,
      habilitada: formData.habilitada,
      tipo_predio: formData.tipo_predio,
      servicio_principal: formData.servicio_principal
    }
    
    onSave(backendData)
  }

  const tiposPredio = [
    'Sede',
    'Planta Industrial',
    'Base Operativa',
    'Oficina Administrativa'
  ]

  const tiposHabilitacion = [
    'Generador',
    'Operador',
    'Transportista',
    'Gestor',
    'Tratador',
    'Almacenamiento'
  ]

  const provincias = [
    'Buenos Aires',
    'Capital Federal',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Cordoba',
    'Corrientes',
    'Entre Rios',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquen',
    'Rio Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucuman'
  ]

  return (
    <GenericModal 
      title={mode === 'crear' ? 'Nueva Sede' : 'Editar Sede'} 
      onClose={onClose}
      size="large"
    >
      <form onSubmit={handleSubmit} className="modal-vehiculo-form sedes-form">
        {/* Seccion 1: Informacion Basica */}
        <div className="form-section">
          <h3 className="form-section-title">Informacion de la Sede</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Codigo</label>
              <input
                type="text"
                className="form-input"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                required
                placeholder="SEDE-001"
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Estado</label>
              <select
                className="form-input form-select"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
              >
                <option value="Activa">Activa</option>
                <option value="Inactiva">Inactiva</option>
                <option value="En Trámite">En Trámite</option>
                <option value="En Mantenimiento">En Mantenimiento</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label required">Nombre de la Sede</label>
            <input
              type="text"
              className="form-input"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Nombre de la sede"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Tipo de Predio</label>
              <select
                className="form-input form-select"
                name="tipo_predio"
                value={formData.tipo_predio}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar...</option>
                {tiposPredio.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required">Servicio Principal</label>
              <input
                type="text"
                className="form-input"
                name="servicio_principal"
                value={formData.servicio_principal}
                onChange={handleChange}
                placeholder="Ej: Tratamiento de residuos"
                required
              />
            </div>
          </div>
        </div>

        {/* Seccion 2: Ubicacion */}
        <div className="form-section">
          <h3 className="form-section-title">Ubicacion</h3>
          
          <div className="form-group">
            <label className="form-label">Direccion</label>
            <input
              type="text"
              className="form-input"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Calle, numero, ciudad"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Localidad</label>
              <input
                type="text"
                className="form-input"
                name="localidad"
                value={formData.localidad}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Provincia</label>
              <select
                className="form-input form-select"
                name="provincia"
                value={formData.provincia}
                onChange={handleChange}
              >
                {provincias.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Seccion 3: Contacto */}
        <div className="form-section">
          <h3 className="form-section-title">Contacto</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Telefono</label>
              <input
                type="tel"
                className="form-input"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="011 2345 6789"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="sede@empresa.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Responsable</label>
            <input
              type="text"
              className="form-input"
              name="responsable"
              value={formData.responsable}
              onChange={handleChange}
              placeholder="Nombre del responsable"
            />
          </div>
        </div>

        {/* Seccion 4: Empresa */}
        <div className="form-section">
          <h3 className="form-section-title">Empresa</h3>
          
          <div className="form-group">
            <label className="form-label">Empresa</label>
            <select
              className="form-input form-select"
              name="empresa_id"
              value={formData.empresa_id}
              onChange={handleChange}
            >
              <option value="">Seleccionar empresa...</option>
              {empresas.map(empresa => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Seccion 5: Habilitaciones */}
        <div className="form-section">
          <h3 className="form-section-title">Habilitaciones</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tipo de Habilitacion</label>
              <select
                className="form-input form-select"
                name="tipo_habilitacion"
                value={formData.tipo_habilitacion}
                onChange={handleChange}
              >
                <option value="">Seleccionar...</option>
                {tiposHabilitacion.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Numero de Habilitacion</label>
              <input
                type="text"
                className="form-input"
                name="habilitacion_numero"
                value={formData.habilitacion_numero}
                onChange={handleChange}
                placeholder="Numero de resolucion"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Vencimiento de Habilitacion</label>
            <input
              type="date"
              className="form-input"
              name="vencimiento_habilitacion"
              value={formData.vencimiento_habilitacion}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Es Base Madre COPESA?</label>
              <select
                className="form-input form-select"
                name="base_madre_copesa"
                value={formData.base_madre_copesa}
                onChange={handleChange}
              >
                <option value="Si">Si</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Base Operativa</label>
              <input
                type="text"
                className="form-input"
                name="base_operativa"
                value={formData.base_operativa}
                onChange={handleChange}
                placeholder="Base operativa relacionada"
              />
            </div>
          </div>
        </div>

        {/* Seccion 6: Certificaciones */}
        <div className="form-section">
          <h3 className="form-section-title">Certificaciones y Seguridad</h3>
          
          <div className="form-group">
            <label className="form-label">Certificaciones</label>
            <textarea
              className="form-input"
              name="certificaciones"
              value={formData.certificaciones}
              onChange={handleChange}
              rows="2"
              placeholder="ISO 14001, ISO 9001, etc."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Seguridad e Higiene</label>
            <textarea
              className="form-input"
              name="seguridad_higiene"
              value={formData.seguridad_higiene}
              onChange={handleChange}
              rows="2"
              placeholder="Normativas de seguridad aplicables"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Habilitada</label>
            <select
              className="form-input form-select"
              name="habilitada"
              value={formData.habilitada}
              onChange={handleChange}
            >
              <option value="Si">Si</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>

        <div className="modal-vehiculo-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            {mode === 'crear' ? 'Crear Sede' : 'Actualizar Sede'}
          </button>
        </div>
      </form>
    </GenericModal>
  )
}

export default SedeForm
