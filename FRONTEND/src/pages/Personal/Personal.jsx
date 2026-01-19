// src/pages/Personal/Personal.jsx - VERSIÓN MEJORADA CON DOCUMENTACIÓN
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
    loadDocuments,
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
    // Implementar filtro por rol si es necesario
  };
  
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
  const handleDocumentUpload = async (file, tipo) => {
    if (selectedPersonal) {
      await handleUploadDocument(selectedPersonal.id, file, tipo);
    }
  };
  
  // Renderizar contenido principal
  const renderContent = () => {
    if (loading && personal.length === 0) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando personal...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="error-message global-error">
          <strong>Error:</strong> {error}
          <button 
            onClick={() => window.location.reload()}
            style={{ marginLeft: '10px', padding: '5px 10px' }}
          >
            Reintentar
          </button>
        </div>
      );
    }
    
    if (personal.length === 0) {
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
                <th>ID/Legajo</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DNI</th>
                <th>CUIL</th>
                <th>Sector</th>
                <th>Cargo</th>
                <th>Rol Sistema</th>
                <th>Venc. Licencia</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {personal.map((persona) => (
                <tr key={persona.id}>
                  <td>{persona.legajo || persona.id}</td>
                  <td>{persona.nombre}</td>
                  <td>{persona.apellido}</td>
                  <td>{persona.dni}</td>
                  <td>{persona.cuil || 'N/A'}</td>
                  <td>{persona.sector}</td>
                  <td>{persona.cargo || persona.puesto}</td>
                  <td>
                    <span className={`rol-badge ${persona.rol === 'admin' ? 'rol-admin' : 'rol-usuario'}`}>
                      {persona.rol === 'admin' ? 'Administrador' : 'Usuario'}
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
                    <span className={`status-badge ${persona.estado === 'Activo' ? 'status-active' : 'status-inactivo'}`}>
                      {persona.estado}
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
          <div className="number">{personal.filter(p => p.rol === 'admin').length}</div>
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
              <span className="btn-icon">📤</span> Exportar
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
            <option value="Administración">Administración</option>
            <option value="Logística">Logística</option>
            <option value="Operaciones">Operaciones</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Incineración">Incineración</option>
            <option value="Tratamiento">Tratamiento</option>
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
            Limpiar
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
            <h3>Documentación Escaneada</h3>
            <div className="documentos-list">
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <div key={index} className="documento-item">
                    <div className="documento-info">
                      <strong>{doc.tipo}</strong>
                      <small>{doc.fecha_subida}</small>
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
                      <button className="icon-btn" title="Descargar">📤</button>
                      <button className="icon-btn" title="Eliminar">🗑️</button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No hay documentos cargados</p>
              )}
            </div>
            
            <div className="subir-documento">
              <h4>Subir nuevo documento</h4>
              <select className="filter-select">
                <option value="">Tipo de documento</option>
                <option value="licencia_conducir">Licencia de Conducir</option>
                <option value="certificado_capacitacion">Certificado de Capacitación</option>
                <option value="carnet_cargas_peligrosas">Carnet Cargas Peligrosas</option>
                <option value="contrato">Contrato Laboral</option>
                <option value="seguro_vida">Seguro de Vida</option>
              </select>
              <input type="date" className="filter-select" placeholder="Fecha vencimiento" />
              <input type="file" className="filter-select" accept=".pdf,.jpg,.jpeg,.png" />
              <button className="btn btn-primary">Subir Documento</button>
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
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </GenericModal>
      )}
    </div>
  );
};

export default Personal;