// src/pages/Personal/Personal.jsx - VERSIÓN COMPLETA CONECTADA AL BACKEND
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePersonalCRUD } from '../../hooks/usePersonalCRUD';
import GenericModal from '../../components/Common/GenericModal';
import PersonalForm from '../../components/DataTable/forms/PersonalForm';
import './Personal.css';

const Personal = () => {
  const {
    // Datos
    personal,
    loading,
    error,
    selectedPersonal,
    
    // Filtros y paginación
    pagination,
    stats,
    
    // Funciones
    handleSearch,
    handleFilterSector,
    handleFilterEstado,
    clearFilters,
    handlePageChange,
    handleCreate,
    handleEdit,
    handleDelete,
    exportData,
    
    // Estados de modales
    isCreateModalOpen,
    isEditModalOpen,
    isViewModalOpen,
    isDeleteModalOpen,
    isDocumentModalOpen,
    
    // Funciones de modales
    openCreateModal,
    openEditModal,
    openViewModal,
    openDeleteModal,
    openDocumentModal,
    
    // Funciones de cierre
    closeCreateModal,
    closeEditModal,
    closeViewModal,
    closeDeleteModal,
    closeDocumentModal,
    
    // Documentos
    documents,
    handleUploadDocument,
    uploadingDocument
  } = usePersonalCRUD();
  
  // Estado local para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedRol, setSelectedRol] = useState('');
  
  // Manejar cambios en filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        handleSearch(searchTerm);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, handleSearch]);
  
  const handleSectorChange = (e) => {
    const sector = e.target.value;
    setSelectedSector(sector);
    handleFilterSector(sector);
  };
  
  const handleEstadoChange = (e) => {
    const estado = e.target.value;
    setSelectedEstado(estado);
    handleFilterEstado(estado);
  };
  
  const handleRolChange = (e) => {
    const rol = e.target.value;
    setSelectedRol(rol);
    // Filtrar por rol localmente
  };
  
  // Filtrar personal por rol (localmente)
  const filteredPersonal = selectedRol 
    ? personal.filter(person => (person.rol_sistema || person.rol) === selectedRol)
    : personal;
  
  // Manejar guardar personal
  const handleSavePersonal = async (personalData) => {
    if (isEditModalOpen && selectedPersonal) {
      await handleEdit(selectedPersonal.id, personalData);
    } else {
      await handleCreate(personalData);
    }
  };
  
  // Manejar confirmación de eliminación
  const handleConfirmDelete = async () => {
    if (selectedPersonal) {
      await handleDelete(selectedPersonal.id);
    }
  };
  
  // Manejar subida de documento
  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (file && selectedPersonal) {
      await handleUploadDocument(selectedPersonal.id, file, 'documento');
      e.target.value = ''; // Reset file input
    }
  };
  
  // Renderizar contenido principal
  const renderContent = () => {
    if (loading && personal.length === 0) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando personal desde el servidor...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="error-message global-error">
          <strong>Error de conexión:</strong> {error}
          <br />
          <small>Verifique que el servidor backend esté en funcionamiento.</small>
          <div style={{ marginTop: '15px' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => window.location.reload()}
            >
              Reintentar conexión
            </button>
          </div>
        </div>
      );
    }
    
    if (personal.length === 0 && !loading) {
      return (
        <div className="empty-state">
          <h3>No hay personal registrado</h3>
          <p>Comienza agregando nuevo personal para gestionar tu equipo</p>
          <button 
            className="btn btn-primary"
            onClick={openCreateModal}
            style={{ marginTop: '15px' }}
          >
            <span>+</span> Agregar Primer Empleado
          </button>
        </div>
      );
    }
    
    return (
      <>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Legajo</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DNI</th>
                <th>CUIL</th>
                <th>Teléfono</th>
                <th>Email Corporativo</th>
                <th>Sector</th>
                <th>Cargo</th>
                <th>Rol</th>
                <th>Licencia</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPersonal.map((persona) => (
                <tr key={persona.id}>
                  <td>
                    <strong>{persona.legajo || `P${String(persona.id).padStart(4, '0')}`}</strong>
                  </td>
                  <td>{persona.nombre}</td>
                  <td>{persona.apellido}</td>
                  <td>{persona.dni}</td>
                  <td>{persona.cuil || 'N/A'}</td>
                  <td>{persona.telefono || 'N/A'}</td>
                  <td>
                    {persona.correo_corporativo ? (
                      <a href={`mailto:${persona.correo_corporativo}`} className="email-link">
                        {persona.correo_corporativo}
                      </a>
                    ) : 'N/A'}
                  </td>
                  <td>{persona.sector}</td>
                  <td>{persona.cargo || persona.puesto}</td>
                  <td>
                    <span className={`rol-badge ${(persona.rol_sistema || persona.rol) === 'admin' ? 'rol-admin' : 'rol-usuario'}`}>
                      {(persona.rol_sistema || persona.rol) === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </td>
                  <td>
                    {persona.vencimiento_licencia ? (
                      <span className={`vencimiento-badge ${
                        new Date(persona.vencimiento_licencia) < new Date() ? 'vencido' :
                        new Date(persona.vencimiento_licencia) < new Date(Date.now() + 30*24*60*60*1000) ? 'por-vencer' : 'vigente'
                      }`}>
                        {new Date(persona.vencimiento_licencia).toLocaleDateString('es-AR')}
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td>
                    <span className={`status-badge ${
                      (persona.estado === 'Activo' || persona.activo === 1) ? 'status-active' : 'status-inactivo'
                    }`}>
                      {persona.estado || (persona.activo === 1 ? 'Activo' : 'Inactivo')}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="icon-btn" 
                        onClick={() => openViewModal(persona)}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button 
                        className="icon-btn" 
                        onClick={() => openEditModal(persona)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        className="icon-btn" 
                        onClick={() => openDocumentModal(persona)}
                        title="Documentos"
                      >
                        📄
                      </button>
                      <button 
                        className="icon-btn" 
                        onClick={() => openDeleteModal(persona)}
                        title="Eliminar"
                        style={{ color: '#ef4444' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {pagination.total_pages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={pagination.current_page === 1 || loading}
              onClick={() => handlePageChange(pagination.current_page - 1)}
            >
              ← Anterior
            </button>
            
            <span className="pagination-info">
              Página {pagination.current_page} de {pagination.total_pages}
              <small> ({pagination.total} registros)</small>
            </span>
            
            <button
              className="pagination-btn"
              disabled={pagination.current_page === pagination.total_pages || loading}
              onClick={() => handlePageChange(pagination.current_page + 1)}
            >
              Siguiente →
            </button>
          </div>
        )}
      </>
    );
  };
  
  // Obtener sectores únicos para el filtro
  const sectoresUnicos = [...new Set(personal.map(p => p.sector).filter(Boolean))];
  
  return (
    <div className="personal-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/" className="breadcrumb-link">Dashboard</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Personal</span>
      </div>
      
      {/* Tarjetas de resumen */}
      <div className="summary-cards">
        <div className="summary-card-small">
          <div className="number">{stats.total}</div>
          <div className="label">Total Empleados</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{stats.active}</div>
          <div className="label">Empleados Activos</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{personal.filter(p => (p.rol_sistema || p.rol) === 'admin').length}</div>
          <div className="label">Administradores</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{personal.filter(p => 
            p.vencimiento_licencia && new Date(p.vencimiento_licencia) < new Date(Date.now() + 30*24*60*60*1000)
          ).length}</div>
          <div className="label">Licencias por Vencer</div>
        </div>
      </div>
      
      {/* Sección principal */}
      <section className="data-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">👥</span>
            Gestión de Personal - Empleados COPESA
          </h2>
          <div className="table-toolbar">
            <button 
              className="btn btn-secondary"
              onClick={exportData}
              disabled={loading || personal.length === 0}
            >
              <span className="btn-icon">📤</span> Exportar CSV
            </button>
            <button 
              className="btn btn-primary"
              onClick={openCreateModal}
              disabled={loading}
            >
              <span className="btn-icon">+</span> Nuevo Personal
            </button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="filter-bar">
          <input
            type="text"
            className="filter-input"
            placeholder="Buscar por nombre, apellido, DNI o legajo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
          <select
            className="filter-select"
            value={selectedSector}
            onChange={handleSectorChange}
            disabled={loading}
          >
            <option value="">Todos los sectores</option>
            {sectoresUnicos.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={selectedRol}
            onChange={handleRolChange}
            disabled={loading}
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="usuario">Usuario</option>
          </select>
          <select
            className="filter-select"
            value={selectedEstado}
            onChange={handleEstadoChange}
            disabled={loading}
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Licencia">Licencia</option>
          </select>
          <button
            className="btn btn-secondary"
            onClick={clearFilters}
            disabled={loading || (!searchTerm && !selectedSector && !selectedRol && !selectedEstado)}
          >
            Limpiar Filtros
          </button>
        </div>
        
        {/* Contenido */}
        {renderContent()}
      </section>
      
      {/* ===== MODALES ===== */}
      
      {/* Modal para Crear */}
      {isCreateModalOpen && (
        <GenericModal
          title="➕ Nuevo Personal"
          onClose={closeCreateModal}
          size="large"
        >
          <PersonalForm
            mode="crear"
            onSave={handleSavePersonal}
            onCancel={closeCreateModal}
            loading={loading}
          />
        </GenericModal>
      )}
      
      {/* Modal para Editar */}
      {isEditModalOpen && selectedPersonal && (
        <GenericModal
          title={`✏️ Editar Personal: ${selectedPersonal.nombre} ${selectedPersonal.apellido}`}
          onClose={closeEditModal}
          size="large"
        >
          <PersonalForm
            mode="editar"
            personal={selectedPersonal}
            onSave={handleSavePersonal}
            onCancel={closeEditModal}
            loading={loading}
          />
        </GenericModal>
      )}
      
      {/* Modal para Ver */}
      {isViewModalOpen && selectedPersonal && (
        <GenericModal
          title={`👁️ Ver Personal: ${selectedPersonal.nombre} ${selectedPersonal.apellido}`}
          onClose={closeViewModal}
          size="large"
        >
          <PersonalForm
            mode="ver"
            personal={selectedPersonal}
            onCancel={closeViewModal}
            readOnly={true}
          />
        </GenericModal>
      )}
      
      {/* Modal de Documentos */}
      {isDocumentModalOpen && selectedPersonal && (
        <GenericModal
          title={`📄 Documentos de ${selectedPersonal.nombre} ${selectedPersonal.apellido}`}
          onClose={closeDocumentModal}
          size="large"
        >
          <div className="documentos-container">
            <div className="documentos-header">
              <h3>Documentación Escaneada</h3>
              <p>Legajo: <strong>{selectedPersonal.legajo}</strong></p>
            </div>
            
            <div className="documentos-list">
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <div key={index} className="documento-item">
                    <div className="documento-info">
                      <strong>{doc.tipo || 'Documento'}</strong>
                      <small>{doc.fecha_subida || doc.created_at || 'Sin fecha'}</small>
                      {doc.vencimiento && (
                        <span className={`vencimiento ${
                          new Date(doc.vencimiento) < new Date() ? 'vencido' :
                          new Date(doc.vencimiento) < new Date(Date.now() + 30*24*60*60*1000) ? 'por-vencer' : 'vigente'
                        }`}>
                          Vence: {new Date(doc.vencimiento).toLocaleDateString('es-AR')}
                        </span>
                      )}
                    </div>
                    <div className="documento-actions">
                      {doc.archivo && (
                        <button 
                          className="icon-btn" 
                          title="Descargar"
                          onClick={() => window.open(doc.archivo, '_blank')}
                        >
                          📤
                        </button>
                      )}
                      <button className="icon-btn" title="Eliminar">🗑️</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-documents">
                  <p>No hay documentos cargados para este empleado</p>
                </div>
              )}
            </div>
            
            <div className="subir-documento">
              <h4>Subir nuevo documento</h4>
              <div className="upload-form">
                <select className="filter-select" id="tipo-documento">
                  <option value="">Tipo de documento</option>
                  <option value="licencia_conducir">Licencia de Conducir</option>
                  <option value="certificado_capacitacion">Certificado de Capacitación</option>
                  <option value="carnet_cargas_peligrosas">Carnet Cargas Peligrosas</option>
                  <option value="contrato">Contrato Laboral</option>
                  <option value="dni">DNI</option>
                  <option value="cv">Curriculum Vitae</option>
                </select>
                <input 
                  type="date" 
                  className="filter-select" 
                  placeholder="Fecha vencimiento (opcional)" 
                  id="fecha-vencimiento"
                />
                <input 
                  type="file" 
                  className="filter-select" 
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" 
                  id="archivo-documento"
                  onChange={handleDocumentUpload}
                  disabled={uploadingDocument}
                />
                <button 
                  className="btn btn-primary"
                  disabled={uploadingDocument}
                >
                  {uploadingDocument ? 'Subiendo...' : 'Subir Documento'}
                </button>
              </div>
            </div>
          </div>
        </GenericModal>
      )}
      
      {/* Modal de Eliminación */}
      {isDeleteModalOpen && selectedPersonal && (
        <GenericModal
          title="🗑️ Confirmar Eliminación"
          onClose={closeDeleteModal}
          size="small"
        >
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>¿Está seguro de eliminar a <strong>{selectedPersonal.nombre} {selectedPersonal.apellido}</strong>?</p>
            <p><small>Legajo: {selectedPersonal.legajo} - DNI: {selectedPersonal.dni}</small></p>
            <p><small>Esta acción no se puede deshacer.</small></p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                className="btn btn-secondary"
                onClick={closeDeleteModal}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleConfirmDelete}
                disabled={loading}
                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
              >
                {loading ? 'Eliminando...' : 'Eliminar Permanentemente'}
              </button>
            </div>
          </div>
        </GenericModal>
      )}
    </div>
  );
};

export default Personal;