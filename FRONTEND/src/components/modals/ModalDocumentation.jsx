// src/components/Common/ModalDocumentation.jsx
import React, { useState } from 'react'
import './ModalVehiculo.css'

const ModalDocumentation = ({ vehiculo, onClose, onSave }) => {
  const [documentos, setDocumentos] = useState(vehiculo?.documentos || [])
  const [nuevoDocumento, setNuevoDocumento] = useState({
    tipo: '',
    vencimiento: '',
    archivo: null
  })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNuevoDocumento(prev => ({
        ...prev,
        archivo: file,
        tipo: file.name.split('.').shift() || 'Documento'
      }))
    }
  }

  const agregarDocumento = () => {
    if (nuevoDocumento.tipo && nuevoDocumento.archivo) {
      setDocumentos(prev => [...prev, {
        ...nuevoDocumento,
        id: Date.now(),
        estado: 'Vigente'
      }])
      setNuevoDocumento({ tipo: '', vencimiento: '', archivo: null })
    }
  }

  const eliminarDocumento = (id) => {
    setDocumentos(prev => prev.filter(doc => doc.id !== id))
  }

  return (
    <div className="modal-vehiculo-overlay">
      <div className="modal-vehiculo-content">
        <div className="modal-vehiculo-header">
          <h2 className="modal-vehiculo-title">📄 Gestión de Documentación</h2>
          <button className="modal-vehiculo-close" onClick={onClose}>×</button>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Cargar Documentos</h3>
          <div 
            className="document-upload"
            onClick={() => document.getElementById('file-input').click()}
          >
            <span>📁</span>
            <p>Haz clic aquí o arrastra archivos para cargar</p>
            <p style={{fontSize: '12px', color: '#6b7280'}}>
              Formatos permitidos: PDF, JPG, PNG (Máx. 10MB)
            </p>
            <input 
              type="file" 
              id="file-input" 
              style={{display: 'none'}} 
              onChange={handleFileChange}
            />
          </div>
          
          {nuevoDocumento.archivo && (
            <div className="document-preview">
              <p>Archivo seleccionado: {nuevoDocumento.archivo.name}</p>
              <button 
                className="btn btn-primary small"
                onClick={agregarDocumento}
              >
                Agregar Documento
              </button>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Documentos Existentes</h3>
          <div className="document-list">
            {documentos.map(doc => (
              <div key={doc.id} className="document-item">
                <div>
                  <strong>{doc.tipo}</strong>
                  {doc.vencimiento && (
                    <div style={{fontSize: '12px', color: '#6b7280'}}>
                      Vence: {new Date(doc.vencimiento).toLocaleDateString('es-AR')}
                    </div>
                  )}
                </div>
                <div className="document-actions">
                  <button className="icon-btn" title="Descargar">📤</button>
                  <button 
                    className="icon-btn" 
                    title="Eliminar"
                    onClick={() => eliminarDocumento(doc.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-vehiculo-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => onSave(documentos)}
          >
            Guardar Documentos
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalDocumentation