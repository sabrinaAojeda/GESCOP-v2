// FRONTEND/src/components/Proveedores/DocumentosProveedorModal.jsx - VERSIÓN CORREGIDA
import React, { useState, useEffect } from 'react';
import GenericModal from '../Common/GenericModal';
import './DocumentosProveedorModal.css';

const DocumentosProveedorModal = ({ proveedor, onClose }) => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    tipo_documento: 'seguro',
    nombre_documento: '',
    descripcion: '',
    fecha_vencimiento: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadDocumentos();
  }, [proveedor.id]);

  const loadDocumentos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/proveedores/documentos_proveedor.php?proveedor_id=${proveedor.id}`);
      const data = await response.json();
      setDocumentos(data.data || []);
    } catch (err) {
      setError('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = (e) => {
    const { name, value } = e.target;
    setUploadData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Por favor seleccione un archivo');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('archivo', selectedFile);
    formData.append('tipo_documento', uploadData.tipo_documento);
    formData.append('nombre_documento', uploadData.nombre_documento);
    formData.append('descripcion', uploadData.descripcion);
    formData.append('fecha_vencimiento', uploadData.fecha_vencimiento);
    formData.append('proveedor_id', proveedor.id);

    try {
      const response = await fetch('/api/proveedores/documentos_proveedor.php', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setShowUploadForm(false);
          setUploadData({
            tipo_documento: 'seguro',
            nombre_documento: '',
            descripcion: '',
            fecha_vencimiento: ''
          });
          setSelectedFile(null);
          loadDocumentos();
          setError('');
        } else {
          setError(result.message || 'Error al subir documento');
        }
      } else {
        setError('Error en la respuesta del servidor');
      }
    } catch (err) {
      setError('Error al subir documento: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocumento = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este documento?')) {
      try {
        const response = await fetch('/api/proveedores/documentos_proveedor.php', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            loadDocumentos();
          } else {
            setError(result.message || 'Error al eliminar documento');
          }
        }
      } catch (err) {
        setError('Error al eliminar documento: ' + err.message);
      }
    }
  };

  const getTipoDocumentoLabel = (tipo) => {
    const labels = {
      'seguro': '📄 Seguro',
      'habilitacion': '🔧 Habilitación',
      'certificado': '🎓 Certificado',
      'contrato': '📝 Contrato',
      'capacitacion': '📚 Capacitación',
      'otro': '📎 Otro'
    };
    return labels[tipo] || tipo;
  };

  const getEstadoDocumento = (fechaVencimiento) => {
    if (!fechaVencimiento) return 'vigente';
    
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const unMesDespues = new Date();
    unMesDespues.setMonth(unMesDespues.getMonth() + 1);
    
    if (vencimiento < hoy) return 'vencido';
    if (vencimiento <= unMesDespues) return 'por_vencer';
    return 'vigente';
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'vigente': <span className="status-badge status-active">Vigente</span>,
      'por_vencer': <span className="status-badge status-warning">Por vencer</span>,
      'vencido': <span className="status-badge status-expired">Vencido</span>
    };
    return badges[estado] || estado;
  };

  return (
    <GenericModal
      title={`📋 Documentación de ${proveedor.razon_social}`}
      onClose={onClose}
      size="xlarge"
      loading={loading}
    >
      <div className="documentos-proveedor-modal">
        {error && (
          <div className="error-message alert-error">
            {error}
          </div>
        )}

        <div className="modal-header">
          <h3>Documentación del Proveedor</h3>
          <button 
            className="btn btn-primary"
            onClick={() => setShowUploadForm(true)}
            disabled={showUploadForm}
          >
            <span className="btn-icon">⬆️</span> Subir Documento
          </button>
        </div>

        {showUploadForm && (
          <div className="upload-form">
            <h4>Subir Nuevo Documento</h4>
            <form onSubmit={handleUploadSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tipo de Documento *</label>
                  <select
                    name="tipo_documento"
                    value={uploadData.tipo_documento}
                    onChange={handleUploadChange}
                    required
                  >
                    <option value="seguro">Seguro</option>
                    <option value="habilitacion">Habilitación</option>
                    <option value="certificado">Certificado</option>
                    <option value="contrato">Contrato</option>
                    <option value="capacitacion">Capacitación</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Nombre del Documento *</label>
                  <input
                    type="text"
                    name="nombre_documento"
                    value={uploadData.nombre_documento}
                    onChange={handleUploadChange}
                    required
                    placeholder="Ej: Póliza Seguro RT 2024"
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Vencimiento</label>
                  <input
                    type="date"
                    name="fecha_vencimiento"
                    value={uploadData.fecha_vencimiento}
                    onChange={handleUploadChange}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={uploadData.descripcion}
                    onChange={handleUploadChange}
                    rows="2"
                    placeholder="Breve descripción del documento..."
                  />
                </div>
                <div className="form-group full-width">
                  <label>Archivo *</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    required
                  />
                  <small className="hint">Formatos aceptados: PDF, JPG, PNG, DOC, DOCX</small>
                </div>
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowUploadForm(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={!selectedFile || loading}>
                  {loading ? 'Subiendo...' : 'Subir Documento'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="documentos-list">
          {documentos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h4>No hay documentos registrados</h4>
              <p>Sube el primer documento del proveedor</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Fecha Subida</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map((doc) => {
                  const estado = getEstadoDocumento(doc.fecha_vencimiento);
                  return (
                    <tr key={doc.id}>
                      <td>{getTipoDocumentoLabel(doc.tipo_documento)}</td>
                      <td>
                        <strong>{doc.nombre_documento}</strong>
                      </td>
                      <td>{doc.descripcion || '-'}</td>
                      <td>{doc.fecha_subida ? new Date(doc.fecha_subida).toLocaleDateString('es-AR') : '-'}</td>
                      <td>
                        {doc.fecha_vencimiento ? 
                          new Date(doc.fecha_vencimiento).toLocaleDateString('es-AR') : 
                          'No vence'}
                      </td>
                      <td>{getEstadoBadge(estado)}</td>
                      <td>
                        <div className="action-buttons">
                          <a 
                            href={`/uploads/proveedores/${doc.archivo_path}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="icon-btn"
                            title="Ver documento"
                          >
                            👁️
                          </a>
                          <a 
                            href={`/uploads/proveedores/${doc.archivo_path}`} 
                            download
                            className="icon-btn"
                            title="Descargar"
                          >
                            ⬇️
                          </a>
                          <button 
                            className="icon-btn" 
                            title="Eliminar"
                            onClick={() => handleDeleteDocumento(doc.id)}
                            style={{ color: '#ef4444' }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </GenericModal>
  );
};

export default DocumentosProveedorModal;