// src/components/DataTable/Forms/PersonalForm.jsx - CON CAMPOS COMPLETOS
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
  // Estados del formulario - COINCIDE CON LA BASE DE DATOS
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    cuil: '',
    legajo: '',
    telefono: '',
    email: '',
    correo_corporativo: '',
    sector: '',
    puesto: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    estado: 'Activo',
    rol: 'usuario',
    direccion: '',
    fecha_nacimiento: '',
    tipo_contrato: 'Planta Permanente',
    
    // Documentación - COINCIDE CON BD
    estado_licencia: '',
    clase_licencia: '',
    vencimiento_licencia: '',
    certificados: [],
    capacitaciones: [],
    carnet_cargas_peligrosas: '',
    vencimiento_carnet: '',
    
    // Información adicional
    base_operativa: '',
    observaciones: '',
    activo: 1
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
    'Incineración',
    'Tratamiento',
    'Almacenamiento',
    'Seguridad',
    'Recursos Humanos',
    'Finanzas'
  ];
  
  const tiposContrato = [
    'Planta Permanente',
    'Contratado',
    'Temporario',
    'Pasantía',
    'Práctica Profesional'
  ];
  
  const basesOperativas = [
    'COPESA Central',
    'Planta Caucho',
    'Caleta Olivia',
    'Base Logística',
    'Incineración',
    'Tratamiento Térmico'
  ];
  
  const tiposHabilitacion = [
    'Generador',
    'Operador',
    'Transportista',
    'Gestor',
    'Tratador',
    'Sin habilitación'
  ];
  
  const categoriasLicencia = [
    'A - Motos',
    'B - Autos',
    'C - Camiones',
    'D - Colectivos',
    'E - Acoplados',
    'F - Maquinaria'
  ];
  
  // Inicializar formulario con datos existentes - MAPEA CORRECTAMENTE A BD
  useEffect(() => {
    if (personal) {
      // Parsear JSON si viene como string
      let certs = [];
      let caps = [];
      if (personal.certificados) {
        certs = typeof personal.certificados === 'string' 
          ? JSON.parse(personal.certificados) 
          : personal.certificados;
      }
      if (personal.capacitaciones) {
        caps = typeof personal.capacitaciones === 'string' 
          ? JSON.parse(personal.capacitaciones) 
          : personal.capacitaciones;
      }
      
      setFormData({
        nombre: personal.nombre || '',
        apellido: personal.apellido || '',
        dni: personal.dni || personal.documento || '',
        cuil: personal.cuil || '',
        legajo: personal.legajo || '',
        telefono: personal.telefono || '',
        email: personal.email || '',
        correo_corporativo: personal.correo_corporativo || personal.email_corporativo || '',
        sector: personal.sector || '',
        puesto: personal.puesto || personal.cargo || '',
        fecha_ingreso: personal.fecha_ingreso || new Date().toISOString().split('T')[0],
        estado: personal.estado || 'Activo',
        rol: personal.rol_sistema || personal.rol || 'usuario',
        direccion: personal.direccion || '',
        fecha_nacimiento: personal.fecha_nacimiento || '',
        tipo_contrato: personal.tipo_contrato || 'Planta Permanente',
        
        // Documentación - Mapea correctamente
        estado_licencia: personal.estado_licencia || '',
        clase_licencia: personal.clase_licencia || personal.categoria_licencia || '',
        vencimiento_licencia: personal.vencimiento_licencia || '',
        certificados: certs,
        capacitaciones: caps,
        carnet_cargas_peligrosas: personal.carnet_cargas_peligrosas || '',
        vencimiento_carnet: personal.vencimiento_carnet || '',
        
        // Información adicional
        base_operativa: personal.base_operativa || '',
        observaciones: personal.observaciones || '',
        activo: personal.activo !== undefined ? personal.activo : 1
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
        
      case 'cuil':
        if (value && !/^\d{2}-\d{8}-\d{1}$/.test(value)) {
          newErrors[name] = 'Formato CUIL inválido (XX-XXXXXXXX-X)';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'email_corporativo':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[name] = 'Email corporativo inválido';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'vencimiento_licencia':
      case 'vencimiento_carnet':
        if (value) {
          const fechaVencimiento = new Date(value);
          if (fechaVencimiento < new Date()) {
            newErrors[name] = 'Fecha de vencimiento pasada';
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
    if (!formData.puesto.trim()) newErrors.puesto = 'Cargo/Puesto es requerido'; // CORREGIDO: de cargo a puesto
    
    // Validaciones específicas
    if (formData.dni && !/^\d{7,8}$/.test(formData.dni.replace(/\D/g, ''))) {
      newErrors.dni = 'DNI inválido (7-8 dígitos)';
    }
    
    if (formData.email_corporativo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_corporativo)) {
      newErrors.email_corporativo = 'Email corporativo inválido';
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
    
    // Formatear datos para enviar al backend - COINCIDE CON LA BASE DE DATOS
    const dataToSend = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      dni: formData.dni.replace(/\D/g, ''),
      cuil: formData.cuil.replace(/\D/g, ''),
      telefono: formData.telefono.replace(/\D/g, ''),
      email: formData.email,
      correo_corporativo: formData.correo_corporativo,
      sector: formData.sector,
      puesto: formData.puesto,
      rol_sistema: formData.rol,
      fecha_ingreso: formData.fecha_ingreso,
      fecha_nacimiento: formData.fecha_nacimiento || null,
      direccion: formData.direccion,
      tipo_contrato: formData.tipo_contrato,
      estado_licencia: formData.estado_licencia,
      clase_licencia: formData.clase_licencia,
      vencimiento_licencia: formData.vencimiento_licencia || null,
      certificados: JSON.stringify(formData.certificados),
      capacitaciones: JSON.stringify(formData.capacitaciones),
      carnet_cargas_peligrosas: formData.carnet_cargas_peligrosas,
      vencimiento_carnet: formData.vencimiento_carnet || null,
      base_operativa: formData.base_operativa,
      observaciones: formData.observaciones,
      activo: formData.activo,
      legajo: formData.legajo
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
        <h3 className="form-section-title">👤 Información Personal</h3>
        
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
            <label className="form-label">CUIL</label>
            <input
              type="text"
              className={`form-input ${touched.cuil && errors.cuil ? 'error' : ''}`}
              name="cuil"
              value={formData.cuil}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={readOnly || loading}
              placeholder="20-12345678-9"
            />
            {renderFieldError('cuil')}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Legajo</label>
            <input
              type="text"
              className="form-input"
              name="legajo"
              value={formData.legajo}
              onChange={handleChange}
              disabled={readOnly || loading}
              placeholder="COP-001"
            />
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
              className={`form-input ${touched.puesto && errors.puesto ? 'error' : ''}`}
              name="puesto"
              value={formData.puesto}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={readOnly || loading}
              placeholder="Ej: Operador, Supervisor, etc."
              required
            />
            {renderFieldError('puesto')}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Base Operativa</label>
            <select
              className="form-input"
              name="base_operativa"
              value={formData.base_operativa}
              onChange={handleChange}
              disabled={readOnly || loading}
            >
              <option value="">Seleccionar base...</option>
              {basesOperativas.map(base => (
                <option key={base} value={base}>{base}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Tipo de Habilitación</label>
            <select
              className="form-input"
              name="habilitacion_tipo"
              value={formData.habilitacion_tipo}
              onChange={handleChange}
              disabled={readOnly || loading}
            >
              <option value="">Seleccionar tipo...</option>
              {tiposHabilitacion.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
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
          
          <div className="form-group">
            <label className="form-label">Rol en el Sistema</label>
            <select
              className="form-input"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              disabled={readOnly || loading}
            >
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
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
            <label className="form-label">Email Personal</label>
            <input
              type="email"
              className={`form-input ${touched.email && errors.email ? 'error' : ''}`}
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={readOnly || loading}
              placeholder="personal@gmail.com"
            />
            {renderFieldError('email')}
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label required">Email Corporativo</label>
          <input
            type="email"
            className={`form-input ${touched.email_corporativo && errors.email_corporativo ? 'error' : ''}`}
            name="email_corporativo"
            value={formData.email_corporativo}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={readOnly || loading}
            placeholder="email@ejemplo.com"
          />
          {renderFieldError('email_corporativo')}
          <small className="helper-text">Email corporativo (opcional)</small>
        </div>
      </div>
      
      {/* Sección 4: Documentación */}
      <div className="form-section">
        <h3 className="form-section-title">📄 Documentación y Certificados</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Licencia de Conducir</label>
            <input
              type="text"
              className="form-input"
              name="licencia_conducir"
              value={formData.licencia_conducir}
              onChange={handleChange}
              disabled={readOnly || loading}
              placeholder="Número de licencia"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <select
              className="form-input"
              name="clase_licencia"
              value={formData.clase_licencia}
              onChange={handleChange}
              disabled={readOnly || loading}
            >
              <option value="">Seleccionar categoría</option>
              {categoriasLicencia.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Vencimiento Licencia</label>
            <input
              type="date"
              className={`form-input ${touched.vencimiento_licencia && errors.vencimiento_licencia ? 'error' : ''}`}
              name="vencimiento_licencia"
              value={formData.vencimiento_licencia}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={readOnly || loading}
            />
            {renderFieldError('vencimiento_licencia')}
          </div>
          
          <div className="form-group">
            <label className="form-label">Carnet Cargas Peligrosas</label>
            <input
              type="text"
              className="form-input"
              name="carnet_cargas_peligrosas"
              value={formData.carnet_cargas_peligrosas}
              onChange={handleChange}
              disabled={readOnly || loading}
              placeholder="Número de carnet"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Vencimiento Carnet</label>
            <input
              type="date"
              className={`form-input ${touched.vencimiento_carnet && errors.vencimiento_carnet ? 'error' : ''}`}
              name="vencimiento_carnet"
              value={formData.vencimiento_carnet}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={readOnly || loading}
            />
            {renderFieldError('vencimiento_carnet')}
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Certificados de Capacitación</label>
          <textarea
            className="form-input"
            name="certificados_capacitacion"
            value={formData.certificados_capacitacion}
            onChange={handleChange}
            disabled={readOnly || loading}
            placeholder="Lista de certificados obtenidos (separados por coma)"
            rows="2"
          />
        </div>
      </div>
      
      {/* Sección 5: Observaciones */}
      <div className="form-section">
        <h3 className="form-section-title">📝 Observaciones</h3>
        
        <div className="form-group">
          <textarea
            className="form-input"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            disabled={readOnly || loading}
            placeholder="Notas adicionales, habilidades especiales, capacitaciones pendientes, etc."
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