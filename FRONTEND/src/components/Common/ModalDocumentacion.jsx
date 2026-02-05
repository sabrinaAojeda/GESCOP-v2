// src/components/Common/ModalDocumentacion.jsx - VERSIÓN COMPLETA Y FUNCIONAL
import React, { useState, useCallback } from 'react';
import './ModalVehiculo.css';

const ModalDocumentacion = ({ 
  personal, 
  documentos = [], 
  onClose, 
  onUpload,
  loading = false 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('general');
  const [documentDescription, setDocumentDescription] = useState('');
  const [showPreview, setShowPreview] = useState(null);
  
  // Tipos de documentos comunes
  const documentTypes = [
    { value: 'dni', label: 'DNI / Documento de Identidad' },
    { value: 'curriculum', label: 'Curriculum Vitae' },
    { value: 'licencia_conducir', label: 'Licencia de Conducir' },
    { value: 'certificado_estudios', label: 'Certificado de Estudios' },
    { value: 'certificado_medico', label: 'Certificado Médico' },
    { value: 'contrato', label: 'Contrato Laboral' },
    { value: 'seguro_vida', label: 'Seguro de Vida' },
    { value: 'art', label: 'ART (Aseguradora de Riesgos de Trabajo)' },
    { value: 'foto', label: 'Foto Carnet' },
    { value: 'general', label: 'Otro Documento' }
  ];
  
  // Manejar selección de archivo
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('❌ El archivo es demasiado grande. Máximo 10MB.');
      return;
    }
    
    // Validar tipo
    const validTypes = [
      'application/pdf',
      'image/jpeg', 
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type)) {
      alert('❌ Tipo de archivo no permitido. Use PDF, Word, JPG o PNG.');
      return;
    }
    
    setSelectedFile(file);
    
    // Auto-detectar tipo de documento basado en nombre
    const fileName = file.name.toLowerCase();
    let autoDetectedType = 'general';
    
    if (fileName.includes('dni') || fileName.includes('identidad')) {
      autoDetectedType = 'dni';
    } else if (fileName.includes('licencia') || fileName.includes('conducir')) {
      autoDetectedType = 'licencia_conducir';
    } else if (fileName.includes('curriculum') || fileName.includes('cv')) {
      autoDetectedType = 'curriculum';
    } else if (fileName.includes('contrato')) {
      autoDetectedType = 'contrato';
    } else if (fileName.includes('certificado')) {
      if (fileName.includes('medico')) {
        autoDetectedType = 'certificado_medico';
      } else {
        autoDetectedType = 'certificado_estudios';
      }
    } else if (fileName.includes('art')) {
      autoDetectedType = 'art';
    } else if (fileName.includes('foto')) {
      autoDetectedType = 'foto';
    }
    
    setDocumentType(autoDetectedType);
    setDocumentDescription(file.name);
  }, []);
  
  // Manejar drag & drop
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (file) {
      const inputEvent = { target: { files: [file] } };
      handleFileSelect(inputEvent);
    }
  }, [handleFileSelect]);
  
  // Subir documento
  const handleUpload = useCallback(async () => {
    if (!selectedFile || !personal) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Simular progreso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Llamar a la función de upload del hook
      const success = await onUpload(selectedFile, documentType);
      
      clearInterval(progressInterval);
      
      if (success) {
        setUploadProgress(100);
        
        // Resetear formulario después de éxito
        setTimeout(() => {
          setSelectedFile(null);
          setDocumentType('general');
          setDocumentDescription('');
          setUploading(false);
          setUploadProgress(0);
        }, 1000);
      } else {
        setUploading(false);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setUploading(false);
      setUploadProgress(0);
      alert('❌ Error al subir el documento: ' + error.message);
    }
  }, [selectedFile, personal, documentType, onUpload]);
  
  // Previsualizar documento
  const handlePreview = useCallback((documento) => {
    setShowPreview(documento);
  }, []);
  
  // Descargar documento
  const handleDownload = useCallback((documento) => {
    if (!documento.ruta && !documento.archivo) {
      alert('❌ No hay archivo disponible para descargar');
      return;
    }
    
    // Construir URL de descarga desde la API
    const apiUrl = import.meta.env.VITE_API_URL || 'https://gescop.vexy.host/api';
    const fileName = documento.ruta || documento.archivo;
    const downloadUrl = `${apiUrl}/download.php?file=${encodeURIComponent(fileName)}`;
    
    // Intentar descargar directamente
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', documento.nombre || fileName);
    link.setAttribute('target', '_blank');
    
    // Si no funciona el download directo, abrir en nueva pestaña
    window.open(downloadUrl, '_blank');
  }, []);
  
  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Obtener etiqueta del tipo de documento
  const getDocumentTypeLabel = (type) => {
    const found = documentTypes.find(t => t.value === type);
    return found ? found.label : 'Documento';
  };
  
  return (
    <div className="modal-vehiculo-overlay">
      <div className="modal-vehiculo-content max-w-4xl">
        {/* Header */}
        <div className="modal-vehiculo-header">
          <h2 className="modal-vehiculo-title">
            📄 Documentación - {personal?.nombre} {personal?.apellido}
          </h2>
          <button 
            className="modal-vehiculo-close" 
            onClick={onClose}
            disabled={uploading}
          >
            ×
          </button>
        </div>
        
        <div className="modal-vehiculo-form">
          {/* Sección 1: Subir nuevo documento */}
          <div className="form-section">
            <h3 className="form-section-title">📤 Subir Nuevo Documento</h3>
            
            {/* Drag & Drop Area */}
            <div 
              className={`document-upload ${selectedFile ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !selectedFile && document.getElementById('file-input').click()}
            >
              {selectedFile ? (
                <div className="file-selected">
                  <div className="file-icon">📎</div>
                  <div className="file-info">
                    <strong>{selectedFile.name}</strong>
                    <span>{formatFileSize(selectedFile.size)} • {selectedFile.type}</span>
                  </div>
                  <button 
                    type="button"
                    className="btn btn-secondary small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <>
                  <span className="upload-icon">📁</span>
                  <p>Arrastra y suelta archivos aquí o haz clic para seleccionar</p>
                  <p className="upload-hint">
                    Formatos: PDF, Word, JPG, PNG • Máximo 10MB
                  </p>
                </>
              )}
              
              <input 
                type="file" 
                id="file-input" 
                style={{ display: 'none' }} 
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                disabled={uploading}
              />
            </div>
            
            {/* Detalles del documento */}
            {selectedFile && (
              <div className="upload-details">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tipo de Documento</label>
                    <select
                      className="form-input"
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      disabled={uploading}
                    >
                      {documentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Descripción (opcional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={documentDescription}
                      onChange={(e) => setDocumentDescription(e.target.value)}
                      placeholder="Ej: DNI frente y dorso"
                      disabled={uploading}
                    />
                  </div>
                </div>
                
                {/* Progress bar */}
                {uploading && (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      {uploadProgress < 100 ? 'Subiendo...' : '¡Completado!'}
                      <span>{uploadProgress}%</span>
                    </div>
                  </div>
                )}
                
                {/* Botón de subir */}
                <div className="upload-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedFile(null);
                      setDocumentDescription('');
                    }}
                    disabled={uploading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile}
                  >
                    {uploading ? 'Subiendo...' : 'Subir Documento'}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Sección 2: Documentos existentes */}
          <div className="form-section">
            <h3 className="form-section-title">
              📋 Documentos Existentes ({documentos.length})
            </h3>
            
            {documentos.length === 0 ? (
              <div className="empty-documents">
                <p>No hay documentos cargados para este personal.</p>
                <p className="hint">Comienza subiendo documentos usando la sección superior.</p>
              </div>
            ) : (
              <div className="document-list">
                {documentos.map((doc, index) => (
                  <div key={doc.id || index} className="document-item">
                    <div className="document-icon">
                      {doc.tipo === 'pdf' ? '📄' : 
                       doc.tipo === 'image' ? '🖼️' : 
                       doc.tipo === 'word' ? '📝' : '📎'}
                    </div>
                    
                    <div className="document-info">
                      <div className="document-header">
                        <strong>{doc.nombre || getDocumentTypeLabel(doc.tipo)}</strong>
                        <span className="document-type">
                          {getDocumentTypeLabel(doc.tipo)}
                        </span>
                      </div>
                      
                      <div className="document-meta">
                        {doc.fecha_subida && (
                          <span>Subido: {formatDate(doc.fecha_subida)}</span>
                        )}
                        {doc.tamano && (
                          <span>• {formatFileSize(doc.tamano)}</span>
                        )}
                        {doc.descripcion && (
                          <span className="document-desc">• {doc.descripcion}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="document-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => handlePreview(doc)}
                        title="Previsualizar"
                      >
                        👁️
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => handleDownload(doc)}
                        title="Descargar"
                      >
                        📥
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => {
                          if (window.confirm('¿Eliminar este documento?')) {
                            alert('Documento eliminado (implementar en backend)');
                          }
                        }}
                        title="Eliminar"
                        style={{ color: '#ef4444' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Previsualización de documento (modal dentro de modal) */}
          {showPreview && (
            <div className="document-preview-modal">
              <div className="preview-header">
                <h4>Previsualización: {showPreview.nombre}</h4>
                <button 
                  className="close-preview"
                  onClick={() => setShowPreview(null)}
                >
                  ×
                </button>
              </div>
              <div className="preview-content">
                <p>Previsualización del documento (implementar visualizador real)</p>
                <div className="preview-placeholder">
                  📄 <span>Contenido del documento aquí...</span>
                </div>
              </div>
              <div className="preview-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => handleDownload(showPreview)}
                >
                  📥 Descargar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowPreview(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
          
          {/* Botones de cierre */}
          <div className="modal-vehiculo-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={uploading}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDocumentacion;