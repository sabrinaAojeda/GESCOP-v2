import React, { useState, useEffect } from 'react';
import GenericModal from '../Common/GenericModal';

const PersonalModal = ({ mode = 'crear', personal, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    sector: '',
    cargo: '',
    telefono: '',
    email: '',
    fecha_ingreso: '',
    estado: 'Activo'
  });

  const [errors, setErrors] = useState({});

  // Cargar datos si está en modo edición
  useEffect(() => {
    if (personal && mode === 'editar') {
      setFormData({
        nombre: personal.nombre || '',
        apellido: personal.apellido || '',
        dni: personal.dni || '',
        sector: personal.sector || '',
        cargo: personal.cargo || '',
        telefono: personal.telefono || '',
        email: personal.email || '',
        fecha_ingreso: personal.fecha_ingreso || '',
        estado: personal.estado || 'Activo'
      });
    }
  }, [personal, mode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    if (!formData.dni.trim()) newErrors.dni = 'El DNI es requerido';
    if (!formData.sector.trim()) newErrors.sector = 'El sector es requerido';
    if (!formData.cargo.trim()) newErrors.cargo = 'El cargo es requerido';

    // Validar formato de email si se proporciona
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const sectors = ['Logística', 'Producción', 'Administración', 'Mantenimiento'];

  return (
    <GenericModal 
      title={mode === 'crear' ? '➕ Nuevo Empleado' : '✏️ Editar Empleado'} 
      onClose={onClose}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="modal-vehiculo-form">
        <div className="form-section">
          <h3 className="form-section-title">Información Personal</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                className={`form-input ${errors.nombre ? 'error' : ''}`}
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
              {errors.nombre && <span className="error-message">{errors.nombre}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Apellido *</label>
              <input
                type="text"
                className={`form-input ${errors.apellido ? 'error' : ''}`}
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
              {errors.apellido && <span className="error-message">{errors.apellido}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">DNI *</label>
              <input
                type="text"
                className={`form-input ${errors.dni ? 'error' : ''}`}
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                required
                disabled={mode === 'editar'} // No se puede editar DNI
              />
              {errors.dni && <span className="error-message">{errors.dni}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="tel"
                className="form-input"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Fecha Ingreso</label>
              <input
                type="date"
                className="form-input"
                name="fecha_ingreso"
                value={formData.fecha_ingreso}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Información Laboral</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sector *</label>
              <select
                className={`form-input ${errors.sector ? 'error' : ''}`}
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar...</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
              {errors.sector && <span className="error-message">{errors.sector}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Cargo *</label>
              <input
                type="text"
                className={`form-input ${errors.cargo ? 'error' : ''}`}
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                required
              />
              {errors.cargo && <span className="error-message">{errors.cargo}</span>}
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
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modal-vehiculo-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (mode === 'crear' ? 'Crear Empleado' : 'Actualizar Empleado')}
          </button>
        </div>
      </form>
    </GenericModal>
  );
};

export default PersonalModal;