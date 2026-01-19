// src/components/forms/EmpresaForm.jsx - VERSIÓN COMPLETA PARA SEDES
import React, { useState, useEffect } from 'react';
import './EmpresaForm.css';

const EmpresaForm = ({ 
  mode = 'crear', 
  sede = null, 
  onSave, 
  onCancel, 
  loading = false,
  readOnly = false 
}) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo: 'Sede',
    direccion: '',
    localidad: '',
    provincia: '',
    telefono: '',
    email: '',
    responsable: '',
    base_operativa: '',
    habilitaciones: [],
    vencimiento_habilitacion: '',
    estado: 'Activa',
    observaciones: ''
  });

  const [documentos, setDocumentos] = useState([]);
  const [nuevoDocumento, setNuevoDocumento] = useState({
    tipo: '',
    numero: '',
    vencimiento: '',
    archivo: null
  });

  const provincias = [
    'Buenos Aires', 'Capital Federal', 'Catamarca', 'Chaco', 'Chubut',
    'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
    'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
    'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
    'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ];

  const tiposSede = [
    'Sede',
    'Planta Industrial', 
    'Base Operativa',
    'Oficina Administrativa',
    'Centro de Distribución',
    'Depósito'
  ];

  const basesOperativas = [
    'COPESA Central',
    'Planta Caucho',
    'Caleta Olivia',
    'Incineración',
    'Tratamiento',
    'Almacenamiento',
    'Logística',
    'Seguridad'
  ];

  const tiposHabilitacion = [
    'Ambiental',
    'Sanitaria',
    'Operativa',
    'Comercial',
    'Municipal',
    'Seguridad Química',
    'Incendio',
    'Habilitación Térmica'
  ];

  useEffect(() => {
    if (sede) {
      setFormData({
        codigo: sede.codigo || '',
        nombre: sede.nombre || '',
        tipo: sede.tipo || 'Sede',
        direccion: sede.direccion || '',
        localidad: sede.localidad || '',
        provincia: sede.provincia || '',
        telefono: sede.telefono || '',
        email: sede.email || '',
        responsable: sede.responsable || '',
        base_operativa: sede.base_operativa || '',
        habilitaciones: sede.habilitaciones || [],
        vencimiento_habilitacion: sede.vencimiento_habilitacion || '',
        estado: sede.estado || 'Activa',
        observaciones: sede.observaciones || ''
      });
    }
  }, [sede]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target;
      if (name === 'habilitaciones') {
        setFormData(prev => {
          const nuevasHabilitaciones = checked
            ? [...prev.habilitaciones, value]
            : prev.habilitaciones.filter(h => h !== value);
          return { ...prev, habilitaciones: nuevasHabilitaciones };
        });
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDocumentoChange = (e) => {
    const { name, value } = e.target;
    setNuevoDocumento(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNuevoDocumento(prev => ({
        ...prev,
        archivo: file,
        tipo: file.name.split('.').shift() || 'Documento'
      }));
    }
  };

  const agregarDocumento = () => {
    if (nuevoDocumento.tipo && nuevoDocumento.archivo) {
      setDocumentos(prev => [...prev, {
        ...nuevoDocumento,
        id: Date.now(),
        estado: 'Vigente'
      }]);
      setNuevoDocumento({ tipo: '', numero: '', vencimiento: '', archivo: null });
    }
  };

  const eliminarDocumento = (id) => {
    setDocumentos(prev => prev.filter(doc => doc.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const datosParaGuardar = {
      ...formData,
      documentos: documentos
    };
    
    onSave(datosParaGuardar);
  };

  return (
    <form onSubmit={handleSubmit} className="empresa-form">
      {/* Sección 1: Información Básica */}
      <div className="form-section">
        <h3 className="form-section-title">🏢 Información de la Sede/Empresa</h3>
        
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
              placeholder="Ej: SED-001"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select
              className="form-input"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              disabled={readOnly || loading}
            >
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
              <option value="En Trámite">En Trámite</option>
              <option value="En Mantenimiento">En Mantenimiento</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label required">Nombre de la Sede/Empresa</label>
          <input
            type="text"
            className="form-input"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            disabled={readOnly || loading}
            placeholder="Ej: Planta Caucho - Caleta Olivia"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">Tipo</label>
            <select
              className="form-input"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              disabled={readOnly || loading}
              required
            >
              <option value="">Seleccionar tipo...</option>
              {tiposSede.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label required">Base Operativa</label>
            <select
              className="form-input"
              name="base_operativa"
              value={formData.base_operativa}
              onChange={handleChange}
              disabled={readOnly || loading}
              required
            >
              <option value="">Seleccionar base...</option>
              {basesOperativas.map(base => (
                <option key={base} value={base}>{base}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sección 2: Ubicación */}
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

      {/* Sección 3: Contacto */}
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
              placeholder="sede@copesa-ar.com"
              required
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
            disabled={readOnly || loading}
            placeholder="Nombre del responsable de la sede"
          />
        </div>
      </div>

      {/* Sección 4: Habilitaciones */}
      <div className="form-section">
        <h3 className="form-section-title">📋 Habilitaciones y Certificaciones</h3>
        
        <div className="form-group">
          <label className="form-label">Habilitaciones Requeridas</label>
          <div className="checkbox-group">
            {tiposHabilitacion.map(habilitacion => (
              <label key={habilitacion} className="checkbox-label">
                <input
                  type="checkbox"
                  name="habilitaciones"
                  value={habilitacion}
                  checked={formData.habilitaciones.includes(habilitacion)}
                  onChange={handleChange}
                  disabled={readOnly || loading}
                />
                {habilitacion}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Vencimiento de Habilitación Principal</label>
          <input
            type="date"
            className="form-input"
            name="vencimiento_habilitacion"
            value={formData.vencimiento_habilitacion}
            onChange={handleChange}
            disabled={readOnly || loading}
          />
        </div>

        {/* Subida de documentos */}
        <div className="documentos-upload">
          <h4>📄 Documentos de Seguridad e Higiene</h4>
          
          <div className="documentos-list">
            {documentos.map(doc => (
              <div key={doc.id} className="documento-item">
                <div>
                  <strong>{doc.tipo}</strong>
                  {doc.numero && <small> - {doc.numero}</small>}
                  {doc.vencimiento && (
                    <div className="vencimiento-info">
                      Vence: {new Date(doc.vencimiento).toLocaleDateString('es-AR')}
                    </div>
                  )}
                </div>
                <div className="documento-actions">
                  <button 
                    type="button"
                    className="icon-btn"
                    onClick={() => eliminarDocumento(doc.id)}
                    disabled={readOnly || loading}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!readOnly && (
            <div className="nuevo-documento">
              <h5>Agregar Documento</h5>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    name="tipo"
                    value={nuevoDocumento.tipo}
                    onChange={handleDocumentoChange}
                    placeholder="Tipo de documento"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    name="numero"
                    value={nuevoDocumento.numero}
                    onChange={handleDocumentoChange}
                    placeholder="Número"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="date"
                    className="form-input"
                    name="vencimiento"
                    value={nuevoDocumento.vencimiento}
                    onChange={handleDocumentoChange}
                    placeholder="Vencimiento"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="file"
                    className="form-input"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.png"
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={agregarDocumento}
                disabled={!nuevoDocumento.tipo || !nuevoDocumento.archivo}
              >
                Agregar Documento
              </button>
            </div>
          )}
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
            placeholder="Observaciones adicionales sobre la sede, procesos químicos, habilitaciones pendientes, etc."
            rows="3"
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
              mode === 'crear' ? 'Crear Sede' : 'Actualizar Sede'
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

export default EmpresaForm;