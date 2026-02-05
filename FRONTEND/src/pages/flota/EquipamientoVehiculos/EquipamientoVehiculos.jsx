// src/pages/flota/EquipamientoVehiculos/EquipamientoVehiculos.jsx
import React, { useState, useEffect } from "react";
import { useEquipamientos } from "@hooks/useEquipamientos";
import useExportXLSX from "@hooks/useExportXLSX";
import GenericModal from "@components/Common/GenericModal";
import ColumnSelectorEquipamientos from "@components/Common/ColumnSelectorEquipamientos";
import ModalEquipamiento from "@components/Common/ModalEquipamiento";
import ModalDocumentacion from "@components/Common/ModalDocumentacion";
import CargaMasiva from "@components/Common/CargaMasiva";
import "@assets/css/buttons.css";
import "./EquipamientoVehiculos.css";

const EquipamientoVehiculos = () => {
  const {
    equipamientos,
    loading,
    error,
    selectedEquipamiento,
    createEquipamiento,
    updateEquipamiento,
    deleteEquipamiento,
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
    closeDocumentacionModal,
    mostrarCargaMasiva,
    setMostrarCargaMasiva
  } = useEquipamientos();
  
  // Hook para exportar datos
  const { exportToXLSX } = useExportXLSX();
  
  // Estados para la gestión de la UI
  const [equipamientosFiltrados, setEquipamientosFiltrados] = useState([]);
  const [mostrarColumnSelector, setMostrarColumnSelector] = useState(false);
  const [filtros, setFiltros] = useState({
    buscar: '',
    tipo: '',
    estado: '',
    vehiculo_asignado: ''
  });

  // Estado para columnas visibles
  const [columnasVisibles, setColumnasVisibles] = useState({
    'codigo': true,
    'descripcion': true,
    'tipo': true,
    'vehiculo_asignado': true,
    'estado': true,
    'ultima_revision': false,
    'proxima_revision': true,
    'observaciones': false
  });

  // Efecto para aplicar filtros
  useEffect(() => {
    let resultados = equipamientos;
    
    // Filtro de búsqueda
    if (filtros.buscar) {
      const termino = filtros.buscar.toLowerCase();
      resultados = resultados.filter(equipamiento =>
        equipamiento.codigo?.toLowerCase().includes(termino) ||
        equipamiento.descripcion?.toLowerCase().includes(termino) ||
        equipamiento.vehiculo_asignado?.toLowerCase().includes(termino)
      );
    }
    
    // Filtro por tipo
    if (filtros.tipo) {
      resultados = resultados.filter(equipamiento => equipamiento.tipo === filtros.tipo);
    }
    
    // Filtro por estado
    if (filtros.estado) {
      resultados = resultados.filter(equipamiento => equipamiento.estado === filtros.estado);
    }

    // Filtro por vehículo asignado
    if (filtros.vehiculo_asignado) {
      if (filtros.vehiculo_asignado === 'sin_asignar') {
        resultados = resultados.filter(equipamiento => !equipamiento.vehiculo_asignado);
      } else {
        resultados = resultados.filter(equipamiento => equipamiento.vehiculo_asignado === filtros.vehiculo_asignado);
      }
    }
    
    setEquipamientosFiltrados(resultados);
  }, [equipamientos, filtros]);

  // Handlers para los modales - Usando funciones del hook
  const abrirModalVer = (equipamiento) => {
    openViewModal(equipamiento);
  };

  const abrirModalEditar = (equipamiento) => {
    openEditModal(equipamiento);
  };

  const abrirModalDocumentacion = (equipamiento) => {
    openDocumentacionModal(equipamiento);
  };

  // Handlers para ColumnSelector
  const abrirColumnSelector = () => {
    setMostrarColumnSelector(true);
  };

  const cerrarColumnSelector = () => {
    setMostrarColumnSelector(false);
  };

  const abrirCargaMasiva = () => {
    setMostrarCargaMasiva(true);
  };

  const cerrarCargaMasiva = () => {
    setMostrarCargaMasiva(false);
  };

  // Handler para exportar datos
  const handleExportar = () => {
    // Preparar datos para exportación - solo campos visibles
    const datosExportar = equipamientos.map(eq => ({
      Código: eq.codigo || '',
      Descripción: eq.descripcion || '',
      Tipo: eq.tipo || '',
      'Vehículo Asignado': eq.vehiculo_asignado || 'No asignado',
      Estado: eq.estado || '',
      'Última Revisión': eq.ultima_revision || '',
      'Próxima Revisión': eq.proxima_revision || '',
      Observaciones: eq.observaciones || ''
    }));
    
    exportToXLSX(datosExportar, 'Equipamientos_Vehiculos');
  };

  const toggleColumna = (columnaKey) => {
    setColumnasVisibles(prev => ({
      ...prev,
      [columnaKey]: !prev[columnaKey]
    }));
  };

  // Handlers para CRUD
  const handleCrearEquipamiento = (datosEquipamiento) => {
    console.log('Creando equipamiento:', datosEquipamiento);
    createEquipamiento(datosEquipamiento)
      .then((result) => {
        if (result.success) {
          alert('Equipamiento creado correctamente');
        } else {
          alert('Error: ' + result.error);
        }
      });
  };

  const handleActualizarEquipamiento = (datosEquipamiento) => {
    console.log('Actualizando equipamiento:', datosEquipamiento);
    updateEquipamiento(selectedEquipamiento.id, datosEquipamiento)
      .then((result) => {
        if (result.success) {
          alert('Equipamiento actualizado correctamente');
        } else {
          alert('Error: ' + result.error);
        }
      });
  };

  const handleEliminarEquipamiento = (id) => {
    const equipamiento = equipamientos.find(e => e.id === id);
    if (equipamiento && window.confirm(`¿Está seguro de eliminar el equipamiento ${equipamiento.codigo} - ${equipamiento.descripcion}? Esta acción no se puede deshacer.`)) {
      deleteEquipamiento(id);
    }
  };

  const handleGuardarDocumentacion = (documentos) => {
    if (selectedEquipamiento) {
      updateEquipamiento(selectedEquipamiento.id, {
        ...selectedEquipamiento,
        documentos: documentos
      });
    }
    closeEditModal();
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

  // Función para obtener clase de estado
  const getEstadoClass = (estado) => {
    if (!estado) return '';
    switch(estado.toLowerCase()) {
      case 'operativo':
        return 'status-active';
      case 'almacenado':
        return 'status-warning';
      case 'mantenimiento':
        return 'status-warning';
      case 'vencido':
        return 'status-expired';
      default:
        return '';
    }
  };

  // Función para verificar si está próximo a vencer
  const estaProximoVencer = (fechaString) => {
    if (!fechaString) return false;
    try {
      const fecha = new Date(fechaString);
      const hoy = new Date();
      const diffTime = fecha - hoy;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    } catch (e) {
      return false;
    }
  };

  // Función para verificar si está vencido
  const estaVencido = (fechaString) => {
    if (!fechaString) return false;
    try {
      const fecha = new Date(fechaString);
      const hoy = new Date();
      return fecha < hoy;
    } catch (e) {
      return false;
    }
  };

  if (loading) return <div className="loading">Cargando equipamientos...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="equipamiento-vehiculos-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a href="#" onClick={() => window.history.back()}>Dashboard</a>
        <span>Equipamiento de Vehículos</span>
      </div>

      {/* Resumen */}
      <div className="summary-cards">
        <div className="summary-card-small">
          <div className="number">{equipamientos.length}</div>
          <div className="label">Total Equipamientos</div>
        </div>
        <div className="summary-card-small">
          <div className="number">
            {equipamientos.filter(e => e.estado === 'Operativo').length}
          </div>
          <div className="label">Operativos</div>
        </div>
        <div className="summary-card-small">
          <div className="number">
            {equipamientos.filter(e => estaProximoVencer(e.proxima_revision)).length}
          </div>
          <div className="label">Próximos a Vencer</div>
        </div>
        <div className="summary-card-small">
          <div className="number">
            {equipamientos.filter(e => !e.vehiculo_asignado).length}
          </div>
          <div className="label">Sin Asignar</div>
        </div>
      </div>

      {/* Sección Principal */}
      <section className="data-section">
        <div className="section-header">
          <h2 className="section-title">🔧 Equipamiento de Vehículos</h2>
          <div className="table-toolbar">
            <button className="teal" onClick={abrirColumnSelector}>
              <span>👁️</span> Columnas
            </button>
            <button className="blue" onClick={handleExportar}>
              <span>📤</span> Exportar
            </button>
            <button className="purple" onClick={abrirCargaMasiva}>
              <span>📥</span> Carga Masiva
            </button>
            <button className="green" onClick={openCreateModal}>
              <span>+</span> Nuevo Equipamiento
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="filter-bar">
          <input 
            type="text" 
            className="filter-select" 
            placeholder="Buscar por código, descripción, vehículo..." 
            value={filtros.buscar}
            onChange={(e) => setFiltros(prev => ({ ...prev, buscar: e.target.value }))}
          />
          <select 
            className="filter-select" 
            value={filtros.tipo}
            onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
          >
            <option value="">Todos los tipos</option>
            <option value="Navegación">Navegación</option>
            <option value="Comunicación">Comunicación</option>
            <option value="Seguridad">Seguridad</option>
            <option value="Control">Control</option>
            <option value="Otros">Otros</option>
          </select>
          <select 
            className="filter-select" 
            value={filtros.estado}
            onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
          >
            <option value="">Todos los estados</option>
            <option value="Operativo">Operativo</option>
            <option value="Almacenado">Almacenado</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Vencido">Vencido</option>
          </select>
          <select 
            className="filter-select" 
            value={filtros.vehiculo_asignado}
            onChange={(e) => setFiltros(prev => ({ ...prev, vehiculo_asignado: e.target.value }))}
          >
            <option value="">Todos los vehículos</option>
            <option value="sin_asignar">Sin asignar</option>
            <option value="AB-123-CD">AB-123-CD</option>
            <option value="EF-456-GH">EF-456-GH</option>
            <option value="IJ-789-KL">IJ-789-KL</option>
            <option value="MA-001-AA">MA-001-AA</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="data-table-wrapper">
          <table className="data-table">
          <thead>
            <tr>
              {columnasVisibles.codigo && <th>CÓDIGO</th>}
              {columnasVisibles.descripcion && <th>DESCRIPCIÓN</th>}
              {columnasVisibles.tipo && <th>TIPO</th>}
              {columnasVisibles.vehiculo_asignado && <th>VEHÍCULO ASIG.</th>}
              {columnasVisibles.estado && <th>ESTADO</th>}
              {columnasVisibles.ultima_revision && <th>ÚLT. REVISIÓN</th>}
              {columnasVisibles.proxima_revision && <th>PRÓX. REVISIÓN</th>}
              {columnasVisibles.observaciones && <th>OBSERVACIONES</th>}
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {equipamientosFiltrados.map(equipamiento => {
              const proximoVencer = estaProximoVencer(equipamiento.proxima_revision);
              const vencido = estaVencido(equipamiento.proxima_revision);
              
              return (
                <tr key={equipamiento.id}>
                  {columnasVisibles.codigo && <td>{equipamiento.codigo}</td>}
                  {columnasVisibles.descripcion && <td>{equipamiento.descripcion}</td>}
                  {columnasVisibles.tipo && <td>{equipamiento.tipo}</td>}
                  {columnasVisibles.vehiculo_asignado && <td>{equipamiento.vehiculo_asignado || 'No asignado'}</td>}
                  {columnasVisibles.estado && (
                    <td>
                      <span className={`status-badge ${getEstadoClass(equipamiento.estado)}`}>
                        {equipamiento.estado}
                      </span>
                    </td>
                  )}
                  {columnasVisibles.ultima_revision && <td>{formatearFecha(equipamiento.ultima_revision)}</td>}
                  {columnasVisibles.proxima_revision && (
                    <td>
                      <span className={`status-badge ${
                        vencido ? 'status-expired' : 
                        proximoVencer ? 'status-warning' : 
                        'status-active'
                      }`}>
                        {formatearFecha(equipamiento.proxima_revision)}
                      </span>
                    </td>
                  )}
                  {columnasVisibles.observaciones && <td>{equipamiento.observaciones || '-'}</td>}
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="icon-btn" 
                        title="Ver" 
                        onClick={() => abrirModalVer(equipamiento)}
                      >
                        👁️
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Editar" 
                        onClick={() => abrirModalEditar(equipamiento)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Documentación" 
                        onClick={() => abrirModalDocumentacion(equipamiento)}
                      >
                        📄
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Eliminar" 
                        onClick={() => handleEliminarEquipamiento(equipamiento.id)}
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
        </div>
        
        <div className="contador">
          Mostrando {equipamientosFiltrados.length} de {equipamientos.length} equipamientos
        </div>
      </section>

      {/* Modal Ver Equipamiento */}
      {isViewModalOpen && selectedEquipamiento && (
        <GenericModal
          title={`👁️ Detalles del Equipamiento - ${selectedEquipamiento.codigo}`}
          onClose={closeViewModal}
          size="large"
        >
          <div className="equipamiento-details-modal">
            <div className="vehicle-details-grid">
              <div>
                <div className="detail-group">
                  <div className="detail-label">Código</div>
                  <div className="detail-value">{selectedEquipamiento.codigo}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Descripción</div>
                  <div className="detail-value">{selectedEquipamiento.descripcion}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Tipo</div>
                  <div className="detail-value">{selectedEquipamiento.tipo}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Vehículo Asignado</div>
                  <div className="detail-value">{selectedEquipamiento.vehiculo_asignado || 'No asignado'}</div>
                </div>
              </div>
              <div>
                <div className="detail-group">
                  <div className="detail-label">Estado</div>
                  <div className="detail-value">
                    <span className={`status-badge ${getEstadoClass(selectedEquipamiento.estado)}`}>
                      {selectedEquipamiento.estado}
                    </span>
                  </div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Última Revisión</div>
                  <div className="detail-value">{formatearFecha(selectedEquipamiento.ultima_revision) || 'No registrada'}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Próxima Revisión</div>
                  <div className="detail-value">
                    <span className={`status-badge ${
                      estaVencido(selectedEquipamiento.proxima_revision) ? 'status-expired' : 
                      estaProximoVencer(selectedEquipamiento.proxima_revision) ? 'status-warning' : 
                      'status-active'
                    }`}>
                      {formatearFecha(selectedEquipamiento.proxima_revision) || 'No programada'}
                    </span>
                  </div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Observaciones</div>
                  <div className="detail-value">{selectedEquipamiento.observaciones || 'Sin observaciones'}</div>
                </div>
              </div>
            </div>

            <div className="documents-section">
              <h3 className="form-section-title">📄 Documentación Asociada</h3>
              <div className="document-cards">
                {selectedEquipamiento.documentos && selectedEquipamiento.documentos.length > 0 ? (
                  selectedEquipamiento.documentos.map(doc => (
                    <div key={doc.id} className="document-card">
                      <div className="document-card-header">
                        <div className="document-card-title">{doc.tipo}</div>
                        <span className={`document-card-status status-badge ${getEstadoClass(doc.estado)}`}>
                          {doc.estado}
                        </span>
                      </div>
                      <div className="detail-group">
                        <div className="detail-label">Vencimiento</div>
                        <div className="detail-value">{formatearFecha(doc.vencimiento) || 'No aplica'}</div>
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
                  <p>No hay documentos asociados a este equipamiento.</p>
                )}
              </div>
            </div>

            <div className="modal-vehiculo-actions">
              <button className="btn btn-secondary" onClick={closeViewModal}>
                Cerrar
              </button>
              <button className="btn btn-primary" onClick={() => {
                closeViewModal();
                setTimeout(() => openEditModal(selectedEquipamiento), 300);
              }}>
                Editar Equipamiento
              </button>
            </div>
          </div>
        </GenericModal>
      )}

      {/* Modales existentes */}
      {isCreateModalOpen && (
        <ModalEquipamiento
          mode="crear"
          onClose={closeCreateModal}
          onSave={handleCrearEquipamiento}
        />
      )}

      {isEditModalOpen && selectedEquipamiento && (
        <ModalEquipamiento
          mode="editar"
          equipamiento={selectedEquipamiento}
          onClose={closeEditModal}
          onSave={handleActualizarEquipamiento}
        />
      )}

      {isDocumentacionModalOpen && selectedEquipamiento && (
        <ModalDocumentacion
          vehiculo={selectedEquipamiento}
          onClose={closeDocumentacionModal}
          onSave={handleGuardarDocumentacion}
        />
      )}

      {/* Column Selector Modal */}
      {mostrarColumnSelector && (
        <ColumnSelectorEquipamientos
          columnasVisibles={columnasVisibles}
          onToggleColumna={toggleColumna}
          onClose={cerrarColumnSelector}
        />
      )}

      {/* Carga Masiva Modal */}
      {mostrarCargaMasiva && (
        <CargaMasiva
          isOpen={mostrarCargaMasiva}
          onClose={cerrarCargaMasiva}
          titulo="Carga Masiva de Equipamientos"
          camposPlantilla={[
            { key: 'codigo', label: 'Código', requerido: true },
            { key: 'descripcion', label: 'Descripción', requerido: true },
            { key: 'tipo', label: 'Tipo', requerido: true },
            { key: 'marca', label: 'Marca', requerido: false },
            { key: 'modelo', label: 'Modelo', requerido: false },
            { key: 'serie', label: 'Serie', requerido: false },
            { key: 'ubicacion', label: 'Ubicación', requerido: false },
            { key: 'estado', label: 'Estado', requerido: false },
            { key: 'responsable', label: 'Responsable', requerido: false },
            { key: 'observaciones', label: 'Observaciones', requerido: false }
          ]}
        />
      )}
    </div>
  );
};

export default EquipamientoVehiculos;