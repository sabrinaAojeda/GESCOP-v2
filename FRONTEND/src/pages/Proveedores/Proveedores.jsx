// FRONTEND/src/pages/Proveedores/Proveedores.jsx - VERSIÓN ACTUALIZADA
import React, { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { useProveedores } from '../../hooks/useProveedores';
import ProveedorTable from '../../components/Proveedores/ProveedorTable';
import ProveedorFilters from '../../components/Proveedores/ProveedorFilters';
import ProveedorModal from '../../components/Proveedores/ProveedorModal';
import ColumnSelectorProveedores from '../../components/Common/ColumnSelectorProveedores';
import './Proveedores.css';

const Proveedores = () => {
  const {
    proveedores,
    loading,
    error,
    pagination,
    filterOptions,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    handlePageChange,
    handleSearch,
    handleRubroFilter,
    handleEstadoFilter,
    handleLocalidadFilter,
    resetFilters,
    exportToCSV
  } = useProveedores();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('crear');
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [columnasVisibles, setColumnasVisibles] = useState({
    codigo: true,
    razon_social: true,
    cuit: true,
    rubro: true,
    contacto: true,
    telefono: false,
    email: false,
    localidad: true,
    estado: true,
    seguro_RT: false,
    direccion: false
  });

  // Manejar crear nuevo proveedor
  const handleCreateProveedor = () => {
    setSelectedProveedor(null);
    setModalMode('crear');
    setShowModal(true);
  };

  // Manejar editar proveedor
  const handleEditProveedor = (proveedor) => {
    setSelectedProveedor(proveedor);
    setModalMode('editar');
    setShowModal(true);
  };

  // Manejar ver proveedor
  const handleViewProveedor = (proveedor) => {
    setSelectedProveedor(proveedor);
    setModalMode('ver');
    setShowModal(true);
  };

  // Manejar eliminar proveedor
  const handleDeleteProveedor = async (proveedor) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${proveedor.razon_social}?`)) {
      const result = await deleteProveedor(proveedor.id);
      if (result.success) {
        alert('Proveedor eliminado exitosamente');
      } else {
        alert(result.error || 'Error al eliminar el proveedor');
      }
    }
  };

  // Manejar guardar proveedor (crear o actualizar)
  const handleSaveProveedor = async (proveedorData) => {
    let result;
    
    if (modalMode === 'crear') {
      result = await createProveedor(proveedorData);
    } else {
      result = await updateProveedor(selectedProveedor.id, proveedorData);
    }

    if (result.success) {
      setShowModal(false);
      // El éxito se maneja en el hook
    } else {
      // El error se maneja en el hook y se muestra en la UI
    }
  };

  // Manejar cambio de columnas visibles
  const handleToggleColumna = (columna) => {
    setColumnasVisibles(prev => ({
      ...prev,
      [columna]: !prev[columna]
    }));
  };

  // Calcular estadísticas
  const proveedoresActivos = proveedores.filter(p => p.estado === 'Activo').length;
  const proveedoresSuspendidos = proveedores.filter(p => p.estado === 'Suspendido').length;
  const proveedoresConSeguro = proveedores.filter(p => p.seguro_RT).length;

  return (
    <div className="proveedores-page">
      <div className="breadcrumb">
        <Link to="/">Dashboard</Link> 
        <span>Proveedores</span>
      </div>

      {error && (
        <div className="error-message global-error">
          {error}
        </div>
      )}

      {/* Tarjetas de resumen */}
      <div className="summary-cards">
        <div className="summary-card-small">
          <div className="number">{proveedores.length}</div>
          <div className="label">Total Proveedores</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{proveedoresActivos}</div>
          <div className="label">Proveedores Activos</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{proveedoresSuspendidos}</div>
          <div className="label">Proveedores Suspendidos</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{proveedoresConSeguro}</div>
          <div className="label">Con Seguro RT</div>
        </div>
      </div>

      <section className="data-section">
        <div className="section-header">
          <h2 className="section-title">🤝 Gestión de Proveedores</h2>
          <div className="table-toolbar">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowColumnSelector(true)}
            >
              <span>👁️</span> Columnas
            </button>
            <button 
              className="btn btn-secondary"
              onClick={exportToCSV}
              disabled={proveedores.length === 0}
            >
              <span>📤</span> Exportar CSV
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleCreateProveedor}
              disabled={loading}
            >
              <span>+</span> Nuevo Proveedor
            </button>
          </div>
        </div>

        {/* Filtros */}
        <ProveedorFilters
          onSearch={handleSearch}
          onRubroFilter={handleRubroFilter}
          onEstadoFilter={handleEstadoFilter}
          onLocalidadFilter={handleLocalidadFilter}
          onReset={resetFilters}
          filterOptions={filterOptions}
          loading={loading}
        />

        {/* Tabla */}
        <ProveedorTable
          proveedores={proveedores}
          loading={loading}
          onEdit={handleEditProveedor}
          onDelete={handleDeleteProveedor}
          onView={handleViewProveedor}
          columnasVisibles={columnasVisibles}
        />

        {/* Paginación */}
        {pagination.total_pages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={pagination.current_page === 1 || loading}
              onClick={() => handlePageChange(pagination.current_page - 1)}
            >
              Anterior
            </button>
            
            <span className="pagination-info">
              Página {pagination.current_page} de {pagination.total_pages}
            </span>
            
            <button
              className="pagination-btn"
              disabled={pagination.current_page === pagination.total_pages || loading}
              onClick={() => handlePageChange(pagination.current_page + 1)}
            >
              Siguiente
            </button>
          </div>
        )}
      </section>

      {/* Modal para crear/editar proveedor */}
      {showModal && (
        <ProveedorModal
          mode={modalMode}
          proveedor={selectedProveedor}
          onClose={() => setShowModal(false)}
          onSave={handleSaveProveedor}
          loading={loading}
        />
      )}

      {/* Selector de columnas */}
      {showColumnSelector && (
        <ColumnSelectorProveedores
          columnasVisibles={columnasVisibles}
          onToggleColumna={handleToggleColumna}
          onClose={() => setShowColumnSelector(false)}
        />
      )}
    </div>
  );
};

// EVITA RE-RENDERS INNECESARIOS
export default memo(Proveedores);