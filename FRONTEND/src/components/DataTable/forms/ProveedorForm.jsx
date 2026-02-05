// src/components/DataTable/forms/ProveedorForm.jsx - FORMULARIO COMPLETO
import React, { useState, useEffect } from 'react';
import './ProveedorForm.css';

const ProveedorForm = ({ 
  mode = 'crear', 
  proveedor = null, 
  onSave, 
  onCancel, 
  loading = false,
  readOnly = false 
}) => {
  const [formData, setFormData] = useState({
    codigo: '',
    razon_social: '',
    cuit: '',
    rubro: '',
    sector_servicio: '',
    servicio_especifico: '',
    direccion: '',
    localidad: '',
    provincia: '',
    telefono: '',
    email: '',
    contacto_nombre: '',
    contacto_cargo: '',
    estado: 'Activo',
    seguro_RT: false,
    seguro_vida_personal: false,
    poliza_RT: '',
    vencimiento_poliza_RT: '',
    habilitacion_personal: '',
    vencimiento_habilitacion_personal: '',
    habilitacion_vehiculo: '',
    vencimiento_habilitacion_vehiculo: '',
    tipo_proveedor: 'servicios',
    observaciones: '',
    frecuencia_renovacion: 'anual',
    proximo_vencimiento: ''
  });

  const rubros = [
    'Servicios de Vigilancia',
    'Transporte',
    'Mantenimiento',
    'Limpieza',
    'Consultoría',
    'Tecnología',
    'Logística',
    'Seguridad Industrial',
    'Capacitación',
    'Otro'
  ];

  const sectoresServicio = [
    'Seguridad',
    'Logística',
    'Mantenimiento',
    'Operaciones',
    'Administración',
    'Recursos Humanos',
    'Tecnología',
    'Compras'
  ];

  // Los valores deben coincidir con el enum de la BD: 'terciarizado','servicios','insumos','equipamiento','otros'
  const tiposProveedor = [
    { value: 'terciarizado', label: 'Terciarizado' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'insumos', label: 'Insumos' },
    { value: 'equipamiento', label: 'Equipamiento' },
    { value: 'otros', label: 'Otros' }
  ];

  const provincias = [
    'Buenos Aires', 'Capital Federal', 'Catamarca', 'Chaco', 'Chubut',
    'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
    'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
    'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
    'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ];

  const frecuenciasRenovacion = [
    { value: 'mensual', label: 'Mensual' },
    { value: 'bimestral', label: 'Bimestral' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' }
  ];

  useEffect(() => {
    if (proveedor) {
      setFormData({
        codigo: proveedor.codigo || '',
        razon_social: proveedor.razon_social || '',
        cuit: proveedor.cuit || '',
        rubro: proveedor.rubro || '',
        sector_servicio: proveedor.sector_servicio || '',
        servicio_especifico: proveedor.servicio_especifico || proveedor.servicio || '',
        direccion: proveedor.direccion || '',
        localidad: proveedor.localidad || '',
        provincia: proveedor.provincia || '',
        telefono: proveedor.telefono || '',
        email: proveedor.email || '',
        contacto_nombre: proveedor.contacto_nombre || '',
        contacto_cargo: proveedor.contacto_cargo || '',
        estado: proveedor.estado || 'Activo',
        seguro_RT: proveedor.seguro_RT || false,
        seguro_vida_personal: proveedor.seguro_vida_personal || false,
        poliza_RT: proveedor.poliza_RT || '',
        vencimiento_poliza_RT: proveedor.vencimiento_poliza_RT || '',
        habilitacion_personal: proveedor.habilitacion_personal || '',
        vencimiento_habilitacion_personal: proveedor.vencimiento_habilitacion_personal || '',
        habilitacion_vehiculo: proveedor.habilitacion_vehiculo || '',
        vencimiento_habilitacion_vehiculo: proveedor.vencimiento_habilitacion_vehiculo || '',
        tipo_proveedor: proveedor.tipo_proveedor || 'servicios',
        observaciones: proveedor.observaciones || '',
        frecuencia_renovacion: proveedor.frecuencia_renovacion || 'anual',
        proximo_vencimiento: proveedor.proximo_vencimiento || ''
      });
    }
  }, [proveedor]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convertir fechas vacías a null para evitar error de formato datetime
    const datosParaGuardar = { ...formData };
    
    // Convertir campos de fecha vacíos a null
    const dateFields = [
      'vencimiento_poliza_RT',
      'vencimiento_habilitacion_personal',
      'vencimiento_habilitacion_vehiculo',
      'proximo_vencimiento'
    ];
    
    dateFields.forEach(field => {
      if (!datosParaGuardar[field] || datosParaGuardar[field] === '') {
        datosParaGuardar[field] = null;
      }
    });
    
    // Calcular próximo vencimiento si no está definido
    if (!datosParaGuardar.proximo_vencimiento) {
      const hoy = new Date();
      let meses = 1;
      
      switch (datosParaGuardar.frecuencia_renovacion) {
        case 'bimestral': meses = 2; break;
        case 'trimestral': meses = 3; break;
        case 'semestral': meses = 6; break;
        case 'anual': meses = 12; break;
      }
      
      hoy.setMonth(hoy.getMonth() + meses);
      datosParaGuardar.proximo_vencimiento = hoy.toISOString().split('T')[0];
    }
    
    onSave(datosParaGuardar);
  };

  return (
    <form onSubmit={handleSubmit} className="proveedor-form">
      {/* Sección 1: Información Básica */}
      <div className="form-section">
        <h3 className="form-section-title">🏢 Información del Proveedor</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">Código</label>
            <input
              type="text"
              className="form-input"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              disabled={readOnly || loading || mode === 'editar'}
              placeholder="PROV-001"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Tipo de Proveedor</label>
            <select
              className="form-input"
              name="tipo_proveedor"
              value={formData.tipo_proveedor}
              onChange={handleChange}
              disabled={readOnly || loading}
            >
              {tiposProveedor.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label required">Razón Social</label>
          <input
            type="text"
            className="form-input"
            name="razon_social"
            value={formData.razon_social}
            onChange={handleChange}
            disabled={readOnly || loading}
            placeholder="Nombre legal de la empresa"
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">CUIT</label>
            <input
              type="text"
              className="form-input"
              name="cuit"
              value={formData.cuit}
              onChange={handleChange}
              disabled={readOnly || loading}
              placeholder="30-12345678-9"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label required">Estado</label>
            <select
              className="form-input"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              disabled={readOnly || loading}
              required
            >
              <option value="Activo">Activo</option>
              <option value="Suspendido">Suspendido</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Sección 2: Rubro y Servicio */}
      <div className="form-section">
        <h3 className="form-section-title">🔧 Rubro y Servicio</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">Rubro Principal</label>
            <select
              className="form-input"
              name="rubro"
              value={formData.rubro}
              onChange={handleChange}
              disabled={readOnly || loading}
              required
            >
              <option value="">Seleccionar rubro...</option>
              {rubros.map(rubro => (
                <option key={rubro} value={rubro}>{rubro}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label required">Sector de Servicio</label>
            <select
              className="form-input"
              name="sector_servicio"
              value={formData.sector_servicio}
              onChange={handleChange}
              disabled={readOnly || loading}
              required
            >
              <option value="">Seleccionar sector...</option>
              {sectoresServicio.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label required">Servicio Específico</label>
          <input
            type="text"
            className="form-input"
            name="servicio_especifico"
            value={formData.servicio_especifico}
            onChange={handleChange}
            disabled={readOnly || loading}
            placeholder="Ej: Vigilancia de Plantas, Transporte Especializado, etc."
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Frecuencia de Renovación Documental</label>
          <select
            className="form-input"
            name="frecuencia_renovacion"
            value={formData.frecuencia_renovacion}
            onChange={handleChange}
            disabled={readOnly || loading}
          >
            {frecuenciasRenovacion.map(frec => (
              <option key={frec.value} value={frec.value}>{frec.label}</option>
            ))}
          </select>
          <small className="helper-text">
            Determina cada cuánto se deben renovar los documentos del proveedor
          </small>
        </div>
      </div>
      
      {/* Sección 3: Ubicación */}
      <div className="form-section">
        <h3 className="form-section-title">📍 Ubicación</h3>
        
        <div className="form-group">
          <label className="form-label required">Dirección</label>
          <input
            type="text"
            className="form-input"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            disabled={readOnly || loading}
            placeholder="Calle, número, piso, departamento"
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">Localidad</label>
            <input
              type="text"
              className="form-input"
              name="localidad"
              value={formData.localidad}
              onChange={handleChange}
              disabled={readOnly || loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label required">Provincia</label>
            <select
              className="form-input"
              name="provincia"
              value={formData.provincia}
              onChange={handleChange}
              disabled={readOnly || loading}
              required
            >
              <option value="">Seleccionar provincia...</option>
              {provincias.map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Sección 4: Contacto */}
      <div className="form-section">
        <h3 className="form-section-title">📞 Contacto</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input
              type="tel"
              className="form-input"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              disabled={readOnly || loading}
              placeholder="011 2345 6789"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label required">Email</label>
            <input
              type="email"
              className="form-input"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={readOnly || loading}
              placeholder="contacto@proveedor.com"
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">Contacto Principal</label>
            <input
              type="text"
              className="form-input"
              name="contacto_nombre"
              value={formData.contacto_nombre}
              onChange={handleChange}
              disabled={readOnly || loading}
              placeholder="Nombre del contacto"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Cargo del Contacto</label>
            <input
              type="text"
              className="form-input"
              name="contacto_cargo"
              value={formData.contacto_cargo}
              onChange={handleChange}
              disabled={readOnly || loading}
              placeholder="Ej: Gerente Comercial, Director, etc."
            />
          </div>
        </div>
      </div>
      
      {/* Sección 5: Seguros y Habilitaciones */}
      <div className="form-section">
        <h3 className="form-section-title">🛡️ Seguros y Habilitaciones</h3>
        
        <div className="checkbox-group-vertical">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="seguro_RT"
              checked={formData.seguro_RT}
              onChange={handleChange}
              disabled={readOnly || loading}
            />
            <span>Seguro de Responsabilidad Civil / RT (Obligatorio)</span>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="seguro_vida_personal"
              checked={formData.seguro_vida_personal}
              onChange={handleChange}
              disabled={readOnly || loading}
            />
            <span>Seguro de Vida para Personal Contratado</span>
          </label>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Habilitación del Personal</label>
            <input
              type="text"
              className="form-input"
              name="habilitacion_personal"
              value={formData.habilitacion_personal}
              onChange={handleChange}
              disabled={readOnly || loading}
              placeholder="Número o descripción"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Vencimiento</label>
            <input
              type="date"
              className="form-input"
              name="vencimiento_habilitacion_personal"
              value={formData.vencimiento_habilitacion_personal}
              onChange={handleChange}
              disabled={readOnly || loading}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Habilitación de Vehículos</label>
            <input
              type="text"
              className="form-input"
              name="habilitacion_vehiculo"
              value={formData.habilitacion_vehiculo}
              onChange={handleChange}
              disabled={readOnly || loading}
              placeholder="Número o descripción"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Vencimiento</label>
            <input
              type="date"
              className="form-input"
              name="vencimiento_habilitacion_vehiculo"
              value={formData.vencimiento_habilitacion_vehiculo}
              onChange={handleChange}
              disabled={readOnly || loading}
            />
          </div>
        </div>
      </div>
      
      {/* Sección 6: Observaciones */}
      <div className="form-section">
        <h3 className="form-section-title">📝 Observaciones</h3>
        
        <div className="form-group">
          <textarea
            className="form-input"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            disabled={readOnly || loading}
            placeholder="Observaciones sobre el proveedor, requisitos especiales, historial, etc."
            rows="4"
          />
        </div>
      </div>
      
      {/* Botones */}
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
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner-small"></span>
                {mode === 'crear' ? 'Creando...' : 'Actualizando...'}
              </>
            ) : (
              mode === 'crear' ? 'Crear Proveedor' : 'Actualizar Proveedor'
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

export default ProveedorForm;