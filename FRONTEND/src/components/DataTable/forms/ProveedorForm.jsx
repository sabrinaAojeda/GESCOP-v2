// FRONTEND/src/components/Proveedores/ProveedorForm.jsx - VERSIÓN ACTUALIZADA
import React, { useState, useEffect } from 'react';
import './ProveedorForm.css';

// Función para validar CUIT argentino
const validarCUIT = (cuit) => {
  if (!cuit) return false;
  
  // Limpiar caracteres no numéricos
  const cuitLimpio = cuit.replace(/-/g, '');
  
  if (cuitLimpio.length !== 11) return false;
  
  // Validar dígito verificador
  const digitos = cuitLimpio.split('').map(Number);
  const coeficientes = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  
  let suma = 0;
  for (let i = 0; i < 10; i++) {
    suma += digitos[i] * coeficientes[i];
  }
  
  const resto = suma % 11;
  const digitoVerificador = resto === 0 ? 0 : 11 - resto;
  
  return digitoVerificador === digitos[10];
};

// Opciones predefinidas para rubros
const RUBROS = [
  'Combustible',
  'Repuestos',
  'Mantenimiento',
  'Seguros',
  'Neumáticos',
  'Lavadero',
  'Lubricantes',
  'Electricidad',
  'Gomería',
  'Chapista/Pintura',
  'Carrocería',
  'Fletes/Transporte',
  'Otros'
];

const ProveedorForm = ({ 
  mode = 'crear', 
  initialData, 
  onSubmit, 
  onCancel,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    codigo: '',
    razon_social: '',
    cuit: '',
    rubro: '',
    direccion: '',
    localidad: '',
    provincia: '',
    telefono: '',
    email: '',
    contacto_nombre: '',
    contacto_cargo: '',
    estado: 'Activo',
    seguro_RT: false,
    habilitacion_personal: '',
    habilitacion_vehiculo: '',
    campos_personalizados: [],
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [camposDinamicos, setCamposDinamicos] = useState([]);

  // Inicializar con datos si existe
  useEffect(() => {
    if (initialData) {
      setFormData({
        codigo: initialData.codigo || '',
        razon_social: initialData.razon_social || '',
        cuit: initialData.cuit || '',
        rubro: initialData.rubro || '',
        direccion: initialData.direccion || '',
        localidad: initialData.localidad || '',
        provincia: initialData.provincia || '',
        telefono: initialData.telefono || '',
        email: initialData.email || '',
        contacto_nombre: initialData.contacto_nombre || '',
        contacto_cargo: initialData.contacto_cargo || '',
        estado: initialData.estado || 'Activo',
        seguro_RT: initialData.seguro_RT || false,
        habilitacion_personal: initialData.habilitacion_personal || '',
        habilitacion_vehiculo: initialData.habilitacion_vehiculo || '',
        campos_personalizados: initialData.campos_personalizados || [],
        ...initialData
      });
      
      // Extraer campos personalizados existentes
      if (initialData.campos_personalizados && initialData.campos_personalizados.length > 0) {
        const nuevosCampos = initialData.campos_personalizados.map(campo => ({
          nombre: campo.nombre,
          tipo: campo.tipo || 'text',
          valor: campo.valor || ''
        }));
        setCamposDinamicos(nuevosCampos);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCUITChange = (e) => {
    let value = e.target.value;
    
    // Formatear automáticamente: XX-XXXXXXXX-X
    value = value.replace(/\D/g, ''); // Solo números
    
    if (value.length > 2) {
      value = value.substring(0, 2) + '-' + value.substring(2);
    }
    if (value.length > 11) {
      value = value.substring(0, 11) + '-' + value.substring(11);
    }
    if (value.length > 13) {
      value = value.substring(0, 13);
    }
    
    setFormData(prev => ({ ...prev, cuit: value }));
    
    // Validar formato mientras escribe
    if (value.length === 13 && !validarCUIT(value)) {
      setErrors(prev => ({ ...prev, cuit: 'CUIT inválido' }));
    } else if (errors.cuit) {
      setErrors(prev => ({ ...prev, cuit: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.codigo.trim()) newErrors.codigo = 'Código requerido';
    if (!formData.razon_social.trim()) newErrors.razon_social = 'Razón social requerida';
    if (!formData.cuit.trim()) newErrors.cuit = 'CUIT requerido';
    if (!validarCUIT(formData.cuit)) newErrors.cuit = 'CUIT inválido';
    if (!formData.rubro.trim()) newErrors.rubro = 'Rubro requerido';
    
    // Validar email si se ingresó
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Preparar campos personalizados
    const camposConValores = camposDinamicos
      .filter(campo => campo.nombre.trim())
      .map(campo => ({
        nombre: campo.nombre.trim(),
        tipo: campo.tipo,
        valor: campo.valor
      }));
    
    const datosEnviar = {
      ...formData,
      campos_personalizados: camposConValores
    };
    
    onSubmit(datosEnviar);
  };

  const agregarCampoDinamico = () => {
    setCamposDinamicos(prev => [
      ...prev,
      { nombre: '', tipo: 'text', valor: '' }
    ]);
  };

  const eliminarCampoDinamico = (index) => {
    setCamposDinamicos(prev => prev.filter((_, i) => i !== index));
  };

  const actualizarCampoDinamico = (index, field, value) => {
    setCamposDinamicos(prev =>
      prev.map((campo, i) =>
        i === index ? { ...campo, [field]: value } : campo
      )
    );
  };

  return (
    <form onSubmit={handleSubmit} className="proveedor-form">
      <div className="form-sections">
        
        {/* Sección 1: Información básica */}
        <div className="form-section">
          <h3 className="section-title">📋 Información del Proveedor</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Código</label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                className={`form-input ${errors.codigo ? 'error' : ''}`}
                placeholder="PROV-001"
                disabled={loading}
              />
              {errors.codigo && <span className="error-message">{errors.codigo}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label required">Razón Social</label>
              <input
                type="text"
                name="razon_social"
                value={formData.razon_social}
                onChange={handleChange}
                className={`form-input ${errors.razon_social ? 'error' : ''}`}
                placeholder="Nombre de la empresa"
                disabled={loading}
              />
              {errors.razon_social && <span className="error-message">{errors.razon_social}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">CUIT</label>
              <input
                type="text"
                name="cuit"
                value={formData.cuit}
                onChange={handleCUITChange}
                className={`form-input ${errors.cuit ? 'error' : ''}`}
                placeholder="30-12345678-9"
                maxLength="13"
                disabled={loading}
              />
              {errors.cuit ? (
                <span className="error-message">{errors.cuit}</span>
              ) : (
                <span className="hint">Formato: XX-XXXXXXXX-X</span>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label required">Rubro</label>
              <select
                name="rubro"
                value={formData.rubro}
                onChange={handleChange}
                className={`form-select ${errors.rubro ? 'error' : ''}`}
                disabled={loading}
              >
                <option value="">Seleccionar rubro...</option>
                {RUBROS.map((rubro, index) => (
                  <option key={index} value={rubro}>{rubro}</option>
                ))}
              </select>
              {errors.rubro && <span className="error-message">{errors.rubro}</span>}
            </div>
          </div>
        </div>

        {/* Sección 2: Ubicación */}
        <div className="form-section">
          <h3 className="section-title">📍 Ubicación</h3>
          
          <div className="form-group">
            <label className="form-label">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="form-input"
              placeholder="Calle, número, piso"
              disabled={loading}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Localidad</label>
              <input
                type="text"
                name="localidad"
                value={formData.localidad}
                onChange={handleChange}
                className="form-input"
                placeholder="Ciudad"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Provincia</label>
              <input
                type="text"
                name="provincia"
                value={formData.provincia}
                onChange={handleChange}
                className="form-input"
                placeholder="Provincia"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Sección 3: Contacto */}
        <div className="form-section">
          <h3 className="section-title">📞 Contacto</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre Contacto</label>
              <input
                type="text"
                name="contacto_nombre"
                value={formData.contacto_nombre}
                onChange={handleChange}
                className="form-input"
                placeholder="Persona de contacto"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Cargo</label>
              <input
                type="text"
                name="contacto_cargo"
                value={formData.contacto_cargo}
                onChange={handleChange}
                className="form-input"
                placeholder="Gerente, Supervisor, etc."
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="form-input"
                placeholder="011-1234-5678"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="contacto@empresa.com"
                disabled={loading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>
        </div>

        {/* Sección 4: Documentación y estado */}
        <div className="form-section">
          <h3 className="section-title">📄 Documentación y Estado</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="form-select"
                disabled={loading}
              >
                <option value="Activo">Activo</option>
                <option value="Suspendido">Suspendido</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="seguro_RT"
                  checked={formData.seguro_RT}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span className="checkbox-text">Seguro de Riesgo de Trabajo</span>
              </label>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Habilitación Personal</label>
              <input
                type="text"
                name="habilitacion_personal"
                value={formData.habilitacion_personal}
                onChange={handleChange}
                className="form-input"
                placeholder="Número o referencia"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Habilitación Vehículo</label>
              <input
                type="text"
                name="habilitacion_vehiculo"
                value={formData.habilitacion_vehiculo}
                onChange={handleChange}
                className="form-input"
                placeholder="Número o referencia"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Sección 5: Campos personalizados */}
        <div className="form-section">
          <div className="section-header">
            <h3 className="section-title">✨ Campos Personalizados</h3>
            <button
              type="button"
              className="btn btn-outline btn-small"
              onClick={agregarCampoDinamico}
              disabled={loading}
            >
              + Agregar Campo
            </button>
          </div>
          
          {camposDinamicos.length === 0 ? (
            <div className="empty-custom-fields">
              <p>No hay campos personalizados. Agrega campos adicionales si los necesitas.</p>
            </div>
          ) : (
            <div className="custom-fields-list">
              {camposDinamicos.map((campo, index) => (
                <div key={index} className="custom-field-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nombre del campo"
                    value={campo.nombre}
                    onChange={(e) => actualizarCampoDinamico(index, 'nombre', e.target.value)}
                    disabled={loading}
                  />
                  
                  <select
                    className="form-select"
                    value={campo.tipo}
                    onChange={(e) => actualizarCampoDinamico(index, 'tipo', e.target.value)}
                    disabled={loading}
                  >
                    <option value="text">Texto</option>
                    <option value="number">Número</option>
                    <option value="date">Fecha</option>
                    <option value="boolean">Sí/No</option>
                  </select>
                  
                  <input
                    type={campo.tipo === 'date' ? 'date' : campo.tipo === 'number' ? 'number' : 'text'}
                    className="form-input"
                    placeholder="Valor"
                    value={campo.valor}
                    onChange={(e) => actualizarCampoDinamico(index, 'valor', e.target.value)}
                    disabled={loading}
                  />
                  
                  <button
                    type="button"
                    className="btn-icon btn-danger"
                    onClick={() => eliminarCampoDinamico(index)}
                    disabled={loading}
                    title="Eliminar campo"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones del formulario */}
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
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Procesando...
              </>
            ) : mode === 'crear' ? (
              'Crear Proveedor'
            ) : (
              'Actualizar Proveedor'
            )}
          </button>
        </div>
        
      </div>
    </form>
  );
};

export default ProveedorForm;