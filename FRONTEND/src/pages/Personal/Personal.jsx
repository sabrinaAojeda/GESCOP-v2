// src/pages/Personal/Personal.jsx - VERSIÓN SIMPLIFICADA Y FUNCIONAL
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
    
    // Funciones de modales
    openCreateModal,
    openEditModal,
    openViewModal,
    openDeleteModal,
    closeCreateModal,
    closeEditModal,
    closeViewModal,
    closeDeleteModal,
    
    // Estado de operaciones
    operationInProgress
  } = usePersonalCRUD();
  
  // Estado local para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  
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
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DNI</th>
                <th>Sector</th>
                <th>Cargo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {personal.map((persona) => (
                <tr key={persona.id}>
                  <td>{persona.id}</td>
                  <td>{persona.nombre}</td>
                  <td>{persona.apellido}</td>
                  <td>{persona.dni}</td>
                  <td>{persona.sector}</td>
                  <td>{persona.cargo || persona.puesto}</td>
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
          <div className="number">{stats.inactive}</div>
          <div className="label">Empleados Inactivos</div>
        </div>
      </div>
      
      {/* Sección principal */}
      <section className="data-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">👥</span>
            Gestión de Personal
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
              disabled={loading || operationInProgress}
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
            placeholder="Buscar por nombre, apellido o DNI..."
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
          </select>
          <button
            className="btn btn-secondary"
            onClick={clearFilters}
            disabled={loading || (!searchTerm && !selectedSector && !selectedEstado)}
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
            loading={operationInProgress}
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
            loading={operationInProgress}
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
      
      {/* Modal de Eliminación */}
      {isDeleteModalOpen && selectedPersonal && (
        <GenericModal
          title="🗑️ Confirmar Eliminación"
          onClose={closeDeleteModal}
          size="small"
        >
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>¿Está seguro de eliminar a <strong>{selectedPersonal.nombre} {selectedPersonal.apellido}</strong>?</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                className="btn btn-secondary"
                onClick={closeDeleteModal}
                disabled={operationInProgress}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleConfirmDelete}
                disabled={operationInProgress}
                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
              >
                {operationInProgress ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </GenericModal>
      )}
    </div>
  );
};

export default Personal;