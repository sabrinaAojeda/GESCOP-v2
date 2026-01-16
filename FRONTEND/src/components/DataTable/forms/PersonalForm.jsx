// src/components/DataTable/Forms/PersonalForm.jsx - CON VALIDACIONES COMPLETAS
import React, { useState, useEffect } from 'react';
import './PersonalForm.css';

const PersonalForm = ({ 
  mode = 'crear', 
  personal = null, 
  onSave, 
  onCancel, 
  loading = false,
  readOnly = false 
}) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    sector: '',
    cargo: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    estado: 'Activo',
    direccion: '',
    fecha_nacimiento: '',
    tipo_contrato: 'Planta Permanente',
    observaciones: ''
  });
  
  // Estados de validación
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Opciones para selects
  const sectores = [
    'Administración',
    'Logística',
    'Operaciones',
    'Mantenimiento',
    'Recursos Humanos',
    'Finanzas',
    'Compras',
    'Ventas',
    'Calidad',
    'Seguridad',
    'Otro'
  ];
  
  const tiposContrato = [
    'Planta Permanente',
    'Contratado',
    'Temporario',
    'Pasantía',
    'Práctica Profesional'
  ];
  
  // Inicializar formulario con datos existentes si estamos editando/viendo
  useEffect(() => {
    if (personal) {
      setFormData({
        nombre: personal.nombre || '',
        apellido: personal.apellido || '',
        dni: personal.dni || personal.documento || '',
        telefono: personal.telefono || '',
        email: personal.email || '',
        sector: personal.sector || '',
        cargo: personal.cargo || personal.puesto || '',
        fecha_ingreso: personal.fecha_ingreso || new Date().toISOString().split('T')[0],
        estado: personal.estado || 'Activo',
        direccion: personal.direccion || '',
        fecha_nacimiento: personal.fecha_nacimiento || '',
        tipo_contrato: personal.tipo_contrato || 'Planta Permanente',
        observaciones: personal.observaciones || ''
      });
    }
  }, [personal]);
  
  // Validaciones
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'nombre':
      case 'apellido':
        if (!value.trim()) {
          newErrors[name] = 'Este campo es requerido';
        } else if (value.length < 2) {
          newErrors[name] = 'Debe tener al menos 2 caracteres';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'dni':
        if (!value.trim()) {
          newErrors[name] = 'El DNI es requerido';
        } else if (!/^\d{7,8}$/.test(value.replace(/\D/g, ''))) {
          newErrors[name] = 'DNI inválido (7-8 dígitos)';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[name] = 'Email inválido';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'telefono':
        if (value && !/^\d{6,15}$/.test(value.replace(/\D/g, ''))) {
          newErrors[name] = 'Teléfono inválido';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'fecha_nacimiento':
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          if (age < 18) {
            newErrors[name] = 'Debe ser mayor de 18 años';
          } else if (age > 100) {
            newErrors[name] = 'Fecha de nacimiento inválida';
          } else {
            delete newErrors[name];
          }
        } else {
          delete newErrors[name];
        }
        break;
        
      default:
        delete newErrors[name];
    }
    
    setErrors(newErrors);
  };
  
  // Validación completa del formulario
  const validateForm = () => {
    const newErrors = {};
    
    // Campos requeridos
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'Apellido es requerido';
    if (!formData.dni.trim()) newErrors.dni = 'DNI es requerido';
    if (!formData.sector.trim()) newErrors.sector = 'Sector es requerido';
    if (!formData.cargo.trim()) newErrors.cargo = 'Cargo es requerido';
    
    // Validaciones específicas
    if (formData.dni && !/^\d{7,8}$/.test(formData.dni.replace(/\D/g, ''))) {
      newErrors.dni = 'DNI inválido (7-8 dígitos)';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Marcar como tocado
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validar en tiempo real
    validateField(name, value);
  };
  
  // Manejar blur (cuando pierde el foco)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };
  
  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar antes de enviar
    if (!validateForm()) {
      // Marcar todos los campos como tocados para mostrar errores
      const allTouched = {};
      Object.keys(formData).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      return;
    }
    
    // Formatear datos para enviar al backend
    const dataToSend = {
      ...formData,
      dni: formData.dni.replace(/\D/g, ''),
      telefono: formData.telefono.replace(/\D/g, ''),
      puesto: formData.cargo // Para compatibilidad con backend
    };
    
    onSave(dataToSend);
  };
  
  // Mostrar error de campo
  const renderFieldError = (fieldName) => {
    if (touched[fieldName] && errors[fieldName]) {
      return <div className="error-message">{errors[fieldName]}</div>;
    }
    return null;
  };
  
  return (
    <form onSubmit={handleSubmit} className="personal-form" id="personal-form">
      {/* Sección 1: Información Personal */}
      <div className="form-section">
        <h3 className="form-section-title">📋 Información Personal</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">Nombre</label>
            <input
              type="text"
              className={`form-input ${touched.nombre && errors.nombre ? 'error' : ''}`}
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={readOnly || loading}
              required
            />
            {renderFieldError('nombre')}
          </div>
          
          <div className="form-group">
            <label className="form-label required">Apellido</label>
            <input
              type="text"
              className={`form-input ${touched.apellido && errors.apellido ? 'error' : ''}`}
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={readOnly || loading}
              required
            />
            {renderFieldError('apellido')}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">DNI</label>
            <input
              type="text"
              className={`form-input ${touched.dni && errors.dni ? 'error' : ''}`}
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={readOnly || loading}
              placeholder="12345678"
              required
            />
            {renderFieldError('dni')}
          </div>
          
          <div className="form-group">
            <label className="form-label">Fecha de Nacimiento</label>
            <input
              type="date"
              className={`form-input ${touched.fecha_nacimiento && errors.fecha_nacimiento ? 'error' : ''}`}
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={readOnly || loading}
              max={new Date().toISOString().split('T')[0]}
            />
            {renderFieldError('fecha_nacimiento')}
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Dirección</label>
          <input
            type="text"
            className="form-input"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            disabled={readOnly || loading}
            placeholder="Calle, Número, Ciudad"
          />
        </div>
      </div>
      
      {/* Sección 2: Información Laboral */}
      <div className="form-section">
        <h3 className="form-section-title">🏢 Información Laboral</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">Sector</label>
            <select
              className={`form-input ${touched.sector && errors.sector ? 'error' : ''}`}
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={readOnly || loading}
              required
            >
              <option value="">Seleccionar sector...</option>
              {sectores.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
            {renderFieldError('sector')}
          </div>
          
          <div className="form-group">
            <label className="form-label required">Cargo/Puesto</label>
            <input
              type="text"
              className={`form-input ${touched.cargo && errors.cargo ? 'error' : ''}`}
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={readOnly || loading}
              placeholder="Ej: Operador, Supervisor, etc."
              required
            />
            {renderFieldError('cargo')}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tipo de Contrato</label>
            <select
              className="form-input"
              name="tipo_contrato"
              value={formData.tipo_contrato}
              onChange={handleChange}
              disabled={readOnly || loading}
            >
              {tiposContrato.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label required">Fecha de Ingreso</label>
            <input
              type="date"
              className="form-input"
              name="fecha_ingreso"
              value={formData.fecha_ingreso}
              onChange={handleChange}
              disabled={readOnly || loading}
              max={new Date().toISOString().split('T')[0]}
              required
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
              disabled={readOnly || loading}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Licencia">Licencia</option>
              <option value="Vacaciones">Vacaciones</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Sección 3: Contacto */}
      <div className="form-section">
        <h3 className="form-section-title">📞 Información de Contacto</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input
              type="tel"
              className={`form-input ${touched.telefono && errors.telefono ? 'error' : ''}`}
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={readOnly || loading}
              placeholder="11 2345 6789"
            />
            {renderFieldError('telefono')}
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-input ${touched.email && errors.email ? 'error' : ''}`}
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={readOnly || loading}
              placeholder="ejemplo@empresa.com"
            />
            {renderFieldError('email')}
          </div>
        </div>
      </div>
      
      {/* Sección 4: Observaciones */}
      <div className="form-section">
        <h3 className="form-section-title">📝 Observaciones</h3>
        
        <div className="form-group">
          <textarea
            className="form-input"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            disabled={readOnly || loading}
            placeholder="Notas adicionales, habilidades especiales, etc."
            rows="3"
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>
      
      {/* Botones de acción */}
      {!readOnly && (
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || Object.keys(errors).length > 0}
          >
            {loading ? (
              <>
                <span className="loading-spinner-small"></span>
                {mode === 'crear' ? 'Creando...' : 'Actualizando...'}
              </>
            ) : (
              mode === 'crear' ? 'Crear Personal' : 'Actualizar Personal'
            )}
          </button>
        </div>
      )}
      
      {readOnly && (
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cerrar
          </button>
        </div>
      )}
    </form>
  );
};

export default PersonalForm;