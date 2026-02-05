// src/components/DataTable/forms/BasesOperativasForm.jsx
import React, { useState, useEffect } from 'react';
import GenericModal from '../../Common/GenericModal';

const BasesOperativasForm = ({ sede, baseOperativa = null, mode = 'crear', onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'Tratamiento',
    responsable: '',
    habilitacion_especifica: '',
    vencimiento_habilitacion: '',
    observaciones: '',
    estado: 'Activa'
  });

  const tiposBase = [
    'Incineración',
    'Tratamiento', 
    'Almacenamiento',
    'Logística',
    'Seguridad',
    'Control de Calidad',
    'Mantenimiento',
    'Administración'
  ];

  useEffect(() => {
    if (baseOperativa) {
      setFormData({
        nombre: baseOperativa.nombre || '',
        tipo: baseOperativa.tipo || 'Tratamiento',
        responsable: baseOperativa.responsable || '',
        habilitacion_especifica: baseOperativa.habilitacion_especifica || '',
        vencimiento_habilitacion: baseOperativa.vencimiento_habilitacion || '',
        observaciones: baseOperativa.observaciones || '',
        estado: baseOperativa.estado || 'Activa'
      });
    }
  }, [baseOperativa]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      sede_id: sede.id,
      ...formData
    });
  };

  return (
    <GenericModal
      title={mode === 'crear' ? '➕ Nueva Base Operativa' : '✏️ Editar Base Operativa'}
      onClose={onCancel}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="empresa-form">
        <div className="form-section">
          <h3 className="form-section-title">🏭 Información de la Base Operativa</h3>
          
          <div className="form-group">
            <label className="form-label required">Nombre de la Base</label>
            <input
              type="text"
              className="form-input"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Horno Principal, Área de Almacenamiento"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Tipo de Base</label>
              <select
                className="form-input"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar tipo...</option>
                {tiposBase.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                className="form-input"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              >
                <option value="Activa">Activa</option>
                <option value="Inactiva">Inactiva</option>
                <option value="En Mantenimiento">En Mantenimiento</option>
              </select>
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
              placeholder="Nombre del responsable asignado"
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">📋 Habilitaciones Específicas</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Habilitación Específica</label>
              <input
                type="text"
                className="form-input"
                name="habilitacion_especifica"
                value={formData.habilitacion_especifica}
                onChange={handleChange}
                placeholder="Número o tipo de habilitación"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vencimiento</label>
              <input
                type="date"
                className="form-input"
                name="vencimiento_habilitacion"
                value={formData.vencimiento_habilitacion}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observaciones</label>
            <textarea
              className="form-input"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Observaciones sobre la base operativa, equipos, procesos especiales, etc."
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            {mode === 'crear' ? 'Crear Base Operativa' : 'Actualizar Base Operativa'}
          </button>
        </div>
      </form>
    </GenericModal>
  );
};

export default BasesOperativasForm;