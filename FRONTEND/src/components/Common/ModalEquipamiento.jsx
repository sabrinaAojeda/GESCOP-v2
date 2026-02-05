// src/components/Common/ModalEquipamiento.jsx
import React, { useState } from 'react'
import GenericModal from './GenericModal'

const ModalEquipamiento = ({ mode = 'crear', equipamiento, onClose, onSave }) => {
  // Los campos deben coincidir con la tabla: codigo, nombre, tipo, marca, modelo, serie, ubicacion, estado, fecha_adquisicion, ultimo_mantenimiento, proximo_mantenimiento, responsable, observaciones
  const [formData, setFormData] = useState({
    codigo: equipamiento?.codigo || '',
    nombre: equipamiento?.nombre || '',
    tipo: equipamiento?.tipo || 'Equipo',
    marca: equipamiento?.marca || '',
    modelo: equipamiento?.modelo || '',
    serie: equipamiento?.serie || '',
    ubicacion: equipamiento?.ubicacion || '',
    estado: equipamiento?.estado || 'Operativo',
    fecha_adquisicion: equipamiento?.fecha_adquisicion || '',
    ultimo_mantenimiento: equipamiento?.ultimo_mantenimiento || '',
    proximo_mantenimiento: equipamiento?.proximo_mantenimiento || '',
    responsable: equipamiento?.responsable || '',
    observaciones: equipamiento?.observaciones || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validaciones básicas
    if (!formData.codigo || !formData.nombre || !formData.tipo) {
      alert('Por favor complete los campos obligatorios (*)')
      return
    }

    onSave(formData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Calcular próximo mantenimiento automáticamente si se ingresa último mantenimiento
  const handleUltimoMantenimientoChange = (e) => {
    const { value } = e.target
    setFormData(prev => {
      const newData = { ...prev, ultimo_mantenimiento: value }
      
      // Si se ingresa un último mantenimiento, calcular próximo (6 meses después)
      if (value) {
        try {
          const ultimo = new Date(value)
          const proximo = new Date(ultimo)
          proximo.setMonth(proximo.getMonth() + 6)
          newData.proximo_mantenimiento = proximo.toISOString().split('T')[0]
        } catch (e) {
          // Si hay error en la fecha, no calcular
        }
      }
      
      return newData
    })
  }

  return (
    <GenericModal 
      title={mode === 'crear' ? '🔧 Nuevo Equipamiento' : '✏️ Editar Equipamiento'} 
      onClose={onClose}
      size="large"
    >
      <form onSubmit={handleSubmit} className="modal-vehiculo-form">
        <div className="form-section">
          <h3 className="form-section-title">Información del Equipamiento</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Código *</label>
              <input
                type="text"
                className="form-input"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                required
                placeholder="Ej: EQ-001"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo *</label>
              <select
                className="form-input"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
              >
                <option value="Equipo">Equipo</option>
                <option value="Maquinaria">Maquinaria</option>
                <option value="Herramienta">Herramienta</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Nombre/Descripción *</label>
            <input
              type="text"
              className="form-input"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Nombre o descripción del equipamiento"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Marca</label>
              <input
                type="text"
                className="form-input"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                placeholder="Ej: Caterpillar"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Modelo</label>
              <input
                type="text"
                className="form-input"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                placeholder="Ej: 320D"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Serie</label>
              <input
                type="text"
                className="form-input"
                name="serie"
                value={formData.serie}
                onChange={handleChange}
                placeholder="Número de serie"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ubicación</label>
              <input
                type="text"
                className="form-input"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                placeholder="Ubicación actual"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                className="form-input"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              >
                <option value="Operativo">Operativo</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Fuera de Servicio">Fuera de Servicio</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fecha Adquisición</label>
              <input
                type="date"
                className="form-input"
                name="fecha_adquisicion"
                value={formData.fecha_adquisicion}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Mantenimiento</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Último Mantenimiento</label>
              <input
                type="date"
                className="form-input"
                name="ultimo_mantenimiento"
                value={formData.ultimo_mantenimiento}
                onChange={handleUltimoMantenimientoChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Próximo Mantenimiento</label>
              <input
                type="date"
                className="form-input"
                name="proximo_mantenimiento"
                value={formData.proximo_mantenimiento}
                onChange={handleChange}
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
              placeholder="Persona responsable del equipamento"
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Observaciones</h3>
          <div className="form-group">
            <textarea
              className="form-input"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Observaciones adicionales sobre el equipamiento..."
              rows="3"
            />
          </div>
        </div>

        <div className="modal-vehiculo-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            {mode === 'crear' ? 'Crear Equipamiento' : 'Actualizar Equipamiento'}
          </button>
        </div>
      </form>
    </GenericModal>
  )
}

export default ModalEquipamiento
