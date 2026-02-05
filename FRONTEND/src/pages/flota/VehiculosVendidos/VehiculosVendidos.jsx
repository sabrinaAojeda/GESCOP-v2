// src/pages/flota/VehiculosVendidos/VehiculosVendidos.jsx
import React, { useState, useEffect } from "react";
import { useVehiculosVendidos } from "@hooks/useVehiculosVendidos";
import GenericModal from "@components/Common/GenericModal";
import ColumnSelectorVehiculosVendidos from "@components/Common/ColumnSelectorVehiculosVendidos";
import ModalVehiculoVendido from "@components/Common/ModalVehiculoVendido";
import ModalDocumentacion from "@components/Common/ModalDocumentacion";
import useExportXLSX from "@hooks/useExportXLSX";
import "./VehiculosVendidos.css";

const VehiculosVendidos = () => {
  const { 
    vehiculosVendidos, 
    loading, 
    error, 
    selectedVehiculoVendido,
    createVehiculoVendido, 
    updateVehiculoVendido, 
    deleteVehiculoVendido,
    isCreateModalOpen,
    isEditModalOpen,
    isViewModalOpen,
    isDocumentacionModalOpen,
    openCreateModal,
    openEditModal,
    openViewModal,
    openDocumentacionModal,
    closeCreateModal,
    closeEditModal,
    closeViewModal,
    closeDocumentacionModal
  } = useVehiculosVendidos();
  const { exportToXLSX } = useExportXLSX();
  
  // Estados para la gestión de la UI
  const [vehiculosFiltrados, setVehiculosFiltrados] = useState([]);
  const [mostrarColumnSelector, setMostrarColumnSelector] = useState(false);
  const [filtros, setFiltros] = useState({
    buscar: '',
    comprador: '',
    estado_documentacion: '',
    año: ''
  });

  // Estado para columnas visibles (5 principales por defecto)
  const [columnasVisibles, setColumnasVisibles] = useState({
    'interno': true,
    'dominio': true,
    'marca_modelo': true,
    'fecha_venta': true,
    'comprador': true,
    'precio': false,
    'estado_documentacion': false,
    'kilometraje_venta': false,
    'observaciones': false
  });

  // Efecto para aplicar filtros
  useEffect(() => {
    let resultados = vehiculosVendidos;
    
    // Filtro de búsqueda
    if (filtros.buscar) {
      const termino = filtros.buscar.toLowerCase();
      resultados = resultados.filter(vehiculo =>
        vehiculo.interno?.toLowerCase().includes(termino) ||
        vehiculo.dominio?.toLowerCase().includes(termino) ||
        vehiculo.marca_modelo?.toLowerCase().includes(termino) ||
        vehiculo.comprador?.toLowerCase().includes(termino)
      );
    }
    
    // Filtro por comprador
    if (filtros.comprador) {
      resultados = resultados.filter(vehiculo => vehiculo.comprador === filtros.comprador);
    }
    
    // Filtro por estado de documentación
    if (filtros.estado_documentacion) {
      resultados = resultados.filter(vehiculo => vehiculo.estado_documentacion === filtros.estado_documentacion);
    }

    // Filtro por año
    if (filtros.año) {
      resultados = resultados.filter(vehiculo => {
        const fechaVenta = new Date(vehiculo.fecha_venta);
        return fechaVenta.getFullYear().toString() === filtros.año;
      });
    }
    
    setVehiculosFiltrados(resultados);
  }, [vehiculosVendidos, filtros]);

  // Handlers para los modales - Usando funciones del hook
  const abrirModalVer = (vehiculo) => {
    openViewModal(vehiculo);
  };

  const abrirModalEditar = (vehiculo) => {
    openEditModal(vehiculo);
  };

  const abrirModalDocumentacion = (vehiculo) => {
    openDocumentacionModal(vehiculo);
  };

  // Handlers para ColumnSelector
  const abrirColumnSelector = () => {
    setMostrarColumnSelector(true);
  };

  const cerrarColumnSelector = () => {
    setMostrarColumnSelector(false);
  };

  const toggleColumna = (columnaKey) => {
    setColumnasVisibles(prev => ({
      ...prev,
      [columnaKey]: !prev[columnaKey]
    }));
  };

  // Handlers para CRUD
  const handleCrearVehiculoVendido = (datosVehiculo) => {
    console.log('Registrando vehículo vendido:', datosVehiculo);
    createVehiculoVendido(datosVehiculo)
      .then((result) => {
        if (result.success) {
          alert('Vehículo vendido registrado correctamente');
        } else {
          alert('Error: ' + result.error);
        }
      });
  };

  const handleActualizarVehiculoVendido = (datosVehiculo) => {
    console.log('Actualizando vehículo vendido:', datosVehiculo);
    updateVehiculoVendido(selectedVehiculoVendido.id, datosVehiculo)
      .then((result) => {
        if (result.success) {
          alert('Vehículo vendido actualizado correctamente');
        } else {
          alert('Error: ' + result.error);
        }
      });
  };

  const handleEliminarVehiculoVendido = (id) => {
    const vehiculo = vehiculosVendidos.find(v => v.id === id);
    if (vehiculo && window.confirm(`¿Está seguro de eliminar el registro de venta del vehículo ${vehiculo.marca_modelo} (${vehiculo.dominio})? Esta acción no se puede deshacer.`)) {
      deleteVehiculoVendido(id);
    }
  };

  const handleGuardarDocumentacion = (documentos) => {
    if (selectedVehiculoVendido) {
      updateVehiculoVendido(selectedVehiculoVendido.id, {
        ...selectedVehiculoVendido,
        documentos: documentos
      });
    }
  };

  // Función para formatear fecha
  const formatearFecha = (fechaString) => {
    if (!fechaString) return '';
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-AR');
    } catch (e) {
      return fechaString;
    }
  };

  // Función para formatear precio
  const formatearPrecio = (precio) => {
    if (!precio) return '';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  };

  // Función para obtener clase de estado
  const getEstadoClass = (estado) => {
    if (!estado) return '';
    switch(estado.toLowerCase()) {
      case 'completa':
        return 'status-active';
      case 'en trámite':
        return 'status-warning';
      case 'incompleta':
        return 'status-expired';
      default:
        return '';
    }
  };

  // Función para exportar a XLSX
  const handleExportarXLSX = () => {
    const datosParaExportar = vehiculosFiltrados.map(vehiculo => ({
      'Interno': vehiculo.interno || '',
      'Dominio': vehiculo.dominio || '',
      'Marca/Modelo': vehiculo.marca_modelo || '',
      'Fecha Venta': formatearFecha(vehiculo.fecha_venta),
      'Comprador': vehiculo.comprador || '',
      'Precio': vehiculo.precio || '',
      'Estado Documentación': vehiculo.estado_documentacion || '',
      'Kilometraje Venta': vehiculo.kilometraje_venta || '',
      'Observaciones': vehiculo.observaciones || ''
    }));
    
    exportToXLSX(datosParaExportar, 'vehiculos_vendidos');
  };

  if (loading) return <div className="loading">Cargando vehículos vendidos...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="vehiculos-vendidos-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a href="#" onClick={() => window.history.back()}>Dashboard</a>
        <span>Vehículos Vendidos</span>
      </div>

      {/* Resumen */}
      <div className="summary-cards">
        <div className="summary-card-small">
          <div className="number">{vehiculosVendidos.length}</div>
          <div className="label">Total Vendidos</div>
        </div>
        <div className="summary-card-small">
          <div className="number">
            {vehiculosVendidos.filter(v => v.estado_documentacion === 'Completa').length}
          </div>
          <div className="label">Documentación Completa</div>
        </div>
        <div className="summary-card-small">
          <div className="number">
            {formatearPrecio(vehiculosVendidos.reduce((total, v) => total + (v.precio || 0), 0))}
          </div>
          <div className="label">Total Recaudado</div>
        </div>
        <div className="summary-card-small">
          <div className="number">
            {new Date().getFullYear()}
          </div>
          <div className="label">Ventas {new Date().getFullYear()}</div>
        </div>
      </div>

      {/* Sección Principal */}
      <section className="data-section">
        <div className="section-header">
          <h2 className="section-title">💰 Vehículos Vendidos</h2>
          <div className="table-toolbar">
            <button className="teal" onClick={abrirColumnSelector}>
              <span>👁️</span> Columnas
            </button>
            <button className="blue" onClick={handleExportarXLSX}>
              <span>📤</span> Exportar
            </button>
            <button className="green" onClick={openCreateModal}>
              <span>+</span> Registrar Venta
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="filter-bar">
          <input 
            type="text" 
            className="filter-select" 
            placeholder="Buscar por interno, dominio, modelo, comprador..." 
            value={filtros.buscar}
            onChange={(e) => setFiltros(prev => ({ ...prev, buscar: e.target.value }))}
          />
          <select 
            className="filter-select" 
            value={filtros.comprador}
            onChange={(e) => setFiltros(prev => ({ ...prev, comprador: e.target.value }))}
          >
            <option value="">Todos los compradores</option>
            <option value="Empresa XYZ S.A.">Empresa XYZ S.A.</option>
            <option value="Transportes ABC">Transportes ABC</option>
            <option value="Logística Rápida S.R.L.">Logística Rápida S.R.L.</option>
            <option value="Construcciones Norte">Construcciones Norte</option>
          </select>
          <select 
            className="filter-select" 
            value={filtros.estado_documentacion}
            onChange={(e) => setFiltros(prev => ({ ...prev, estado_documentacion: e.target.value }))}
          >
            <option value="">Todos los estados</option>
            <option value="Completa">Completa</option>
            <option value="En trámite">En trámite</option>
            <option value="Incompleta">Incompleta</option>
          </select>
          <select 
            className="filter-select" 
            value={filtros.año}
            onChange={(e) => setFiltros(prev => ({ ...prev, año: e.target.value }))}
          >
            <option value="">Todos los años</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="data-table-wrapper">
          <table className="data-table">
          <thead>
            <tr>
              {columnasVisibles.interno && <th>INT.</th>}
              {columnasVisibles.dominio && <th>DOMINIO</th>}
              {columnasVisibles.marca_modelo && <th>MARCA/MODELO</th>}
              {columnasVisibles.fecha_venta && <th>FECHA VENTA</th>}
              {columnasVisibles.comprador && <th>COMPRADOR</th>}
              {columnasVisibles.precio && <th>PRECIO</th>}
              {columnasVisibles.estado_documentacion && <th>ESTADO DOC.</th>}
              {columnasVisibles.kilometraje_venta && <th>KM VENTA</th>}
              {columnasVisibles.observaciones && <th>OBSERVACIONES</th>}
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {vehiculosFiltrados.map(vehiculo => (
              <tr key={vehiculo.id}>
                {columnasVisibles.interno && <td>{vehiculo.interno}</td>}
                {columnasVisibles.dominio && <td>{vehiculo.dominio}</td>}
                {columnasVisibles.marca_modelo && <td>{vehiculo.marca_modelo}</td>}
                {columnasVisibles.fecha_venta && <td>{formatearFecha(vehiculo.fecha_venta)}</td>}
                {columnasVisibles.comprador && <td>{vehiculo.comprador}</td>}
                {columnasVisibles.precio && <td>{formatearPrecio(vehiculo.precio)}</td>}
                {columnasVisibles.estado_documentacion && (
                  <td>
                    <span className={`status-badge ${getEstadoClass(vehiculo.estado_documentacion)}`}>
                      {vehiculo.estado_documentacion}
                    </span>
                  </td>
                )}
                {columnasVisibles.kilometraje_venta && <td>{vehiculo.kilometraje_venta ? `${vehiculo.kilometraje_venta.toLocaleString()} km` : '-'}</td>}
                {columnasVisibles.observaciones && <td>{vehiculo.observaciones || '-'}</td>}
                <td>
                  <div className="action-buttons">
                    <button 
                      className="icon-btn" 
                      title="Ver" 
                      onClick={() => abrirModalVer(vehiculo)}
                    >
                      👁️
                    </button>
                    <button 
                      className="icon-btn" 
                      title="Editar" 
                      onClick={() => abrirModalEditar(vehiculo)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="icon-btn" 
                      title="Documentación" 
                      onClick={() => abrirModalDocumentacion(vehiculo)}
                    >
                      📄
                    </button>
                    <button 
                      className="icon-btn" 
                      title="Eliminar" 
                      onClick={() => handleEliminarVehiculoVendido(vehiculo.id)}
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
        
        <div className="contador">
          Mostrando {vehiculosFiltrados.length} de {vehiculosVendidos.length} vehículos vendidos
        </div>
      </section>

      {/* Modal Ver Vehículo Vendido */}
      {isViewModalOpen && selectedVehiculoVendido && (
        <GenericModal
          title={`👁️ Detalles de Venta - ${selectedVehiculoVendido.dominio}`}
          onClose={closeViewModal}
          size="xlarge"
        >
          <div className="vehicle-details-modal">
            <div className="vehicle-details-grid">
              <div>
                <div className="detail-group">
                  <div className="detail-label">Interno</div>
                  <div className="detail-value">{selectedVehiculoVendido.interno}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Dominio</div>
                  <div className="detail-value">{selectedVehiculoVendido.dominio}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Marca/Modelo</div>
                  <div className="detail-value">{selectedVehiculoVendido.marca_modelo}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Fecha de Venta</div>
                  <div className="detail-value">{formatearFecha(selectedVehiculoVendido.fecha_venta)}</div>
                </div>
              </div>
              <div>
                <div className="detail-group">
                  <div className="detail-label">Comprador</div>
                  <div className="detail-value">{selectedVehiculoVendido.comprador}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Precio de Venta</div>
                  <div className="detail-value">{formatearPrecio(selectedVehiculoVendido.precio)}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Kilometraje al Vender</div>
                  <div className="detail-value">{selectedVehiculoVendido.kilometraje_venta ? `${selectedVehiculoVendido.kilometraje_venta.toLocaleString()} km` : 'No registrado'}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Estado Documentación</div>
                  <div className="detail-value">
                    <span className={`status-badge ${getEstadoClass(selectedVehiculoVendido.estado_documentacion)}`}>
                      {selectedVehiculoVendido.estado_documentacion}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <div className="form-section-title">📝 Observaciones</div>
              <div className="detail-group">
                <div className="detail-value">{selectedVehiculoVendido.observaciones || 'Sin observaciones'}</div>
              </div>
            </div>

            <div className="documents-section">
              <h3 className="form-section-title">📄 Documentación de Venta</h3>
              <div className="document-cards">
                {selectedVehiculoVendido.documentos && selectedVehiculoVendido.documentos.length > 0 ? (
                  selectedVehiculoVendido.documentos.map(doc => (
                    <div key={doc.id} className="document-card">
                      <div className="document-card-header">
                        <div className="document-card-title">{doc.tipo}</div>
                        <span className={`document-card-status status-badge ${getEstadoClass(doc.estado)}`}>
                          {doc.estado}
                        </span>
                      </div>
                      <div className="detail-group">
                        <div className="detail-label">Archivo</div>
                        <div className="detail-value">{doc.archivo}</div>
                      </div>
                      <div className="action-buttons" style={{marginTop: '10px'}}>
                        <button className="icon-btn" title="Descargar">📤</button>
                        <button className="icon-btn" title="Ver">👁️</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No hay documentos asociados a esta venta.</p>
                )}
              </div>
            </div>

            <div className="modal-vehiculo-actions">
              <button className="btn btn-secondary" onClick={closeViewModal}>
                Cerrar
              </button>
              <button className="btn btn-primary" onClick={() => {
                closeViewModal();
                setTimeout(() => openEditModal(selectedVehiculoVendido), 300);
              }}>
                Editar Registro
              </button>
            </div>
          </div>
        </GenericModal>
      )}

      {/* Modales existentes */}
      {isCreateModalOpen && (
        <ModalVehiculoVendido
          mode="crear"
          onClose={closeCreateModal}
          onSave={handleCrearVehiculoVendido}
        />
      )}

      {isEditModalOpen && selectedVehiculoVendido && (
        <ModalVehiculoVendido
          mode="editar"
          vehiculo={selectedVehiculoVendido}
          onClose={closeEditModal}
          onSave={handleActualizarVehiculoVendido}
        />
      )}

      {isDocumentacionModalOpen && selectedVehiculoVendido && (
        <ModalDocumentacion
          vehiculo={selectedVehiculoVendido}
          onClose={closeDocumentacionModal}
          onSave={handleGuardarDocumentacion}
        />
      )}

      {/* Column Selector Modal */}
      {mostrarColumnSelector && (
        <ColumnSelectorVehiculosVendidos
          columnasVisibles={columnasVisibles}
          onToggleColumna={toggleColumna}
          onClose={cerrarColumnSelector}
        />
      )}
    </div>
  );
};

export default VehiculosVendidos;