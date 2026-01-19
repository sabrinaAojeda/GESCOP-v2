import React, { useState } from 'react';
import './Configuration.css';

const Configuration = () => {
  const [configData, setConfigData] = useState({
    // Alertas
    diasVTV: 30,
    diasSeguro: 45,
    diasLicencias: 60,
    diasMantenimiento: 15,
    
    // Email
    emailNotificaciones: 'gestiondocumental@copesa-ar.com',
    
    // Seguridad
    tiempoSesion: 120,
    intentosLogin: 3,
    
    // Habilitaciones Copesa
    tiposHabilitacion: ['Generador', 'Operador', 'Transportista', 'Gestor'],
    basesOperativas: ['Incineración', 'Tratamiento', 'Almacenamiento', 'Logística'],
    
    // Reportes
    reporteSemanalAutomatico: true,
    diaReporteSemanal: 'Lunes',
    mantenerReportesMeses: 12
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfigData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    alert('Configuración guardada exitosamente');
  };

  return (
    <div className="configuration-page">
      <div className="page-header">
        <h1>⚙️ Configuración del Sistema</h1>
        <p className="page-subtitle">Gestión de parámetros y habilitaciones del sistema GESCOP</p>
      </div>

      <div className="configuration-content">
        {/* SECCIÓN HABILITACIONES COPESA */}
        <div className="config-section">
          <h3 className="section-title">🏢 Habilitaciones COPESA</h3>
          
          <div className="config-grid">
            <div className="config-group">
              <label className="config-label">Tipos de Habilitación</label>
              <select 
                name="tiposHabilitacion" 
                className="config-input"
                multiple
                size="4"
                value={configData.tiposHabilitacion}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setConfigData(prev => ({ ...prev, tiposHabilitacion: selected }));
                }}
              >
                <option value="Generador">Generador</option>
                <option value="Operador">Operador</option>
                <option value="Transportista">Transportista</option>
                <option value="Gestor">Gestor</option>
                <option value="Tratador">Tratador</option>
                <option value="Acopiador">Acopiador</option>
              </select>
              <small>Mantén CTRL para seleccionar múltiples</small>
            </div>

            <div className="config-group">
              <label className="config-label">Bases Operativas</label>
              <select 
                name="basesOperativas" 
                className="config-input"
                multiple
                size="4"
                value={configData.basesOperativas}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setConfigData(prev => ({ ...prev, basesOperativas: selected }));
                }}
              >
                <option value="Incineración">Incineración</option>
                <option value="Tratamiento">Tratamiento</option>
                <option value="Almacenamiento">Almacenamiento</option>
                <option value="Logística">Logística</option>
                <option value="Planta Caucho">Planta Caucho</option>
                <option value="Caleta Olivia">Caleta Olivia</option>
              </select>
              <small>Subdivisiones por servicio</small>
            </div>

            <div className="config-group full-width">
              <label className="config-label">Certificados Principales</label>
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" checked /> Habilitación Ambiental
                </label>
                <label>
                  <input type="checkbox" checked /> Certificado de Seguridad
                </label>
                <label>
                  <input type="checkbox" checked /> Habilitación Sanitaria
                </label>
                <label>
                  <input type="checkbox" /> Habilitación Operativa
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN HABILITACIONES POR PREDIO */}
        <div className="config-section">
          <h3 className="section-title">📍 Habilitaciones por Predio/Base</h3>
          
          <div className="config-grid">
            <div className="config-group">
              <label className="config-label">Predio Habilita a Columna</label>
              <select className="config-input">
                <option value="">Seleccionar predio base...</option>
                <option value="copesa_central">COPESA Central</option>
                <option value="planta_caucho">Planta Caucho</option>
                <option value="caleta_olivia">Caleta Olivia</option>
                <option value="base_logistica">Base Logística</option>
              </select>
            </div>

            <div className="config-group">
              <label className="config-label">Base Madre</label>
              <input 
                type="text" 
                className="config-input" 
                value="COPESA S.A."
                readOnly
              />
            </div>

            <div className="config-group full-width">
              <label className="config-label">Subdivisiones por Servicio</label>
              <textarea 
                className="config-input"
                rows="3"
                placeholder="Ej: Incineración - Tratamiento Térmico&#10;Almacenamiento - Residuos Peligrosos&#10;Logística - Transporte Especializado"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN ALERTAS */}
        <div className="config-section">
          <h3 className="section-title">🔔 Configuración de Alertas</h3>
          <div className="config-grid">
            <div className="config-group">
              <label className="config-label">Días previos para alerta de VTV</label>
              <input 
                type="number" 
                className="config-input" 
                name="diasVTV"
                value={configData.diasVTV}
                onChange={handleChange}
              />
            </div>
            <div className="config-group">
              <label className="config-label">Días previos para alerta de Seguro</label>
              <input 
                type="number" 
                className="config-input" 
                name="diasSeguro"
                value={configData.diasSeguro}
                onChange={handleChange}
              />
            </div>
            <div className="config-group">
              <label className="config-label">Días previos para alerta de Licencias</label>
              <input 
                type="number" 
                className="config-input" 
                name="diasLicencias"
                value={configData.diasLicencias}
                onChange={handleChange}
              />
            </div>
            <div className="config-group">
              <label className="config-label">Días previos para alerta de Mantenimiento</label>
              <input 
                type="number" 
                className="config-input" 
                name="diasMantenimiento"
                value={configData.diasMantenimiento}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN REPORTES */}
        <div className="config-section">
          <h3 className="section-title">📊 Configuración de Reportes</h3>
          <div className="config-grid">
            <div className="config-group">
              <label className="config-label">
                <input 
                  type="checkbox" 
                  name="reporteSemanalAutomatico"
                  checked={configData.reporteSemanalAutomatico}
                  onChange={handleChange}
                />
                Reporte Semanal Automático (cada 7 días)
              </label>
            </div>
            
            <div className="config-group">
              <label className="config-label">Día para reporte semanal</label>
              <select 
                className="config-input"
                name="diaReporteSemanal"
                value={configData.diaReporteSemanal}
                onChange={handleChange}
              >
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miércoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
              </select>
            </div>

            <div className="config-group">
              <label className="config-label">Mantener reportes por (meses)</label>
              <input 
                type="number" 
                className="config-input" 
                name="mantenerReportesMeses"
                value={configData.mantenerReportesMeses}
                onChange={handleChange}
                min="1"
                max="36"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN NOTIFICACIONES */}
        <div className="config-section">
          <h3 className="section-title">📧 Notificaciones por Email</h3>
          <div className="config-grid">
            <div className="config-group full-width">
              <label className="config-label">Email para notificaciones</label>
              <input 
                type="email" 
                className="config-input" 
                name="emailNotificaciones"
                value={configData.emailNotificaciones}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN SEGURIDAD */}
        <div className="config-section">
          <h3 className="section-title">🔐 Seguridad</h3>
          <div className="config-grid">
            <div className="config-group">
              <label className="config-label">Tiempo de sesión (minutos)</label>
              <input 
                type="number" 
                className="config-input" 
                name="tiempoSesion"
                value={configData.tiempoSesion}
                onChange={handleChange}
              />
            </div>
            <div className="config-group">
              <label className="config-label">Intentos de login fallidos</label>
              <input 
                type="number" 
                className="config-input" 
                name="intentosLogin"
                value={configData.intentosLogin}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="config-actions">
          <button className="btn btn-secondary">Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}>
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

export default Configuration;