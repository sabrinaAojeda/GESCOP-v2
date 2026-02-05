// FRONTEND/src/pages/flota/HistorialVehicular/HistorialVehicular.jsx
import React, { useState, useEffect } from 'react';
import { useVehiculos } from '@hooks/useVehiculos';
import ModalVehiculo from '@components/Common/ModalVehiculo';
import useExportXLSX from '@hooks/useExportXLSX';
import './HistorialVehicular.css';

const HistorialVehicular = () => {
  const { 
    vehiculos, 
    loading, 
    error, 
    selectedVehiculo,
    createVehiculo, 
    updateVehiculo, 
    deleteVehiculo,
    stats,
    isCreateModalOpen,
    isEditModalOpen,
    isViewModalOpen,
    openCreateModal,
    openEditModal,
    openViewModal,
    closeCreateModal,
    closeEditModal,
    closeViewModal
  } = useVehiculos();
  const { exportToXLSX } = useExportXLSX();
  
  // Estados para UI
  const [vehiculosFiltrados, setVehiculosFiltrados] = useState([]);
  const [filtros, setFiltros] = useState({
    buscar: '',
    sector: '',
    estado: ''
  });

  // Efecto para aplicar filtros
  useEffect(() => {
    let resultados = vehiculos;
    
    // Filtro de búsqueda
    if (filtros.buscar) {
      const termino = filtros.buscar.toLowerCase();
      resultados = resultados.filter(vehiculo =>
        vehiculo.interno?.toLowerCase().includes(termino) ||
        vehiculo.dominio?.toLowerCase().includes(termino) ||
        vehiculo.modelo?.toLowerCase().includes(termino)
      );
    }
    
    // Filtro por sector
    if (filtros.sector) {
      resultados = resultados.filter(vehiculo => vehiculo.sector === filtros.sector);
    }
    
    // Filtro por estado
    if (filtros.estado) {
      resultados = resultados.filter(vehiculo => vehiculo.estado === filtros.estado);
    }
    
    setVehiculosFiltrados(resultados);
  }, [vehiculos, filtros]);

  // Handlers para modales - Usando funciones del hook
  const abrirModalVer = (vehiculo) => {
    openViewModal(vehiculo);
  };

  const abrirModalEditar = (vehiculo) => {
    openEditModal(vehiculo);
  };

  // Handlers para CRUD
  const handleCrearVehiculo = async (datosVehiculo) => {
    try {
      const resultado = await createVehiculo(datosVehiculo);
      if (resultado.success) {
        alert('✅ Vehículo creado correctamente');
      } else {
        alert(`❌ Error: ${resultado.error}`);
      }
    } catch (err) {
      alert('❌ Error al crear vehículo');
      console.error(err);
    }
  };

  const handleActualizarVehiculo = async (datosVehiculo) => {
    if (!selectedVehiculo) return;
    
    try {
      const resultado = await updateVehiculo(selectedVehiculo.interno, datosVehiculo);
      if (resultado.success) {
        alert('✅ Vehículo actualizado correctamente');
      } else {
        alert(`❌ Error: ${resultado.error}`);
      }
    } catch (err) {
      alert('❌ Error al actualizar vehículo');
      console.error(err);
    }
  };

  const handleEliminarVehiculo = async (interno) => {
    const vehiculo = vehiculos.find(v => v.interno === interno);
    if (vehiculo && window.confirm(`¿Está seguro de eliminar el vehículo ${vehiculo.modelo} (${vehiculo.dominio})?`)) {
      try {
        const resultado = await deleteVehiculo(interno);
        if (resultado.success) {
          alert('✅ Vehículo eliminado correctamente');
        } else {
          alert(`❌ Error: ${resultado.error}`);
        }
      } catch (err) {
        alert('❌ Error al eliminar vehículo');
        console.error(err);
      }
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

  // Función para obtener clase de estado
  const getEstadoClass = (estado) => {
    if (!estado) return '';
    switch(estado.toLowerCase()) {
      case 'activo':
      case 'vigente':
        return 'status-active';
      case 'por vencer':
      case 'mantenimiento':
        return 'status-warning';
      case 'vencido':
      case 'inactivo':
        return 'status-expired';
      default:
        return '';
    }
  };

  // Obtener sectores únicos para filtro
  const sectoresUnicos = [...new Set(vehiculos.map(v => v.sector).filter(Boolean))];
  const estadosUnicos = [...new Set(vehiculos.map(v => v.estado).filter(Boolean))];

  // Handler para exportar datos a XLSX
  const handleExportar = () => {
    const datosParaExportar = vehiculosFiltrados.map(v => ({
      'Interno': v.interno || '',
      'Dominio': v.dominio || '',
      'Modelo': v.modelo || '',
      'Año': v.año || '',
      'Tipo': v.tipo || '',
      'Sector': v.sector || '',
      'Estado': v.estado || '',
      'VTV Vencimiento': formatearFecha(v.vtv_vencimiento),
      'Chofer': v.chofer || ''
    }));
    
    exportToXLSX(datosParaExportar, 'historial_vehicular');
  };

  if (loading) return <div className="loading">Cargando historial vehicular...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="historial-vehicular-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a href="#" onClick={() => window.history.back()}>Dashboard</a>
        <span>📋 Historial Vehicular</span>
      </div>

      {/* Resumen - Matching VehiculosVendidos style */}
      <div className="summary-cards">
        <div className="summary-card-small">
          <div className="number">{stats.total}</div>
          <div className="label">Total Vehículos</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{stats.activos}</div>
          <div className="label">En Servicio</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{stats.mantenimiento}</div>
          <div className="label">En Mantenimiento</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{stats.rodados}</div>
          <div className="label">Rodados</div>
        </div>
      </div>

      {/* Sección Principal - Matching VehiculosVendidos style */}
      <section className="data-section">
        <div className="section-header">
          <h2 className="section-title">📋 Historial Vehicular</h2>
          <div className="table-toolbar">
            <button className="blue" onClick={handleExportar}>
              <span>📤</span> Exportar
            </button>
            <button className="green" onClick={openCreateModal}>
              <span>+</span> Nuevo Vehículo
            </button>
          </div>
        </div>

        {/* Filtros - Matching VehiculosVendidos style */}
        <div className="filter-bar">
          <input 
            type="text" 
            className="filter-select" 
            placeholder="Buscar por interno, dominio, modelo..." 
            value={filtros.buscar}
            onChange={(e) => setFiltros(prev => ({ ...prev, buscar: e.target.value }))}
          />
          <select 
            className="filter-select" 
            value={filtros.sector}
            onChange={(e) => setFiltros(prev => ({ ...prev, sector: e.target.value }))}
          >
            <option value="">Todos los sectores</option>
            {sectoresUnicos.map((sector, index) => (
              <option key={index} value={sector}>{sector}</option>
            ))}
          </select>
          <select 
            className="filter-select" 
            value={filtros.estado}
            onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
          >
            <option value="">Todos los estados</option>
            {estadosUnicos.map((estado, index) => (
              <option key={index} value={estado}>{estado}</option>
            ))}
          </select>
        </div>

        {/* Tabla - Matching VehiculosVendidos style */}
        <div className="data-table-wrapper">
          <table className="data-table">
          <thead>
            <tr>
              <th>INTERNO</th>
              <th>DOMINIO</th>
              <th>MODELO</th>
              <th>AÑO</th>
              <th>TIPO</th>
              <th>SECTOR</th>
              <th>ESTADO</th>
              <th>VTV VTO.</th>
              <th>CHOFER</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {vehiculosFiltrados.length > 0 ? (
              vehiculosFiltrados.map(vehiculo => (
                <tr key={vehiculo.interno}>
                  <td><strong>{vehiculo.interno}</strong></td>
                  <td>
                    <span className="status-badge status-active">{vehiculo.dominio}</span>
                  </td>
                  <td>{vehiculo.modelo}</td>
                  <td>{vehiculo.año}</td>
                  <td>
                    <span className={`status-badge ${vehiculo.tipo === 'Rodado' ? 'status-active' : 'status-warning'}`}>
                      {vehiculo.tipo}
                    </span>
                  </td>
                  <td>{vehiculo.sector}</td>
                  <td>
                    <span className={`status-badge ${getEstadoClass(vehiculo.estado)}`}>
                      {vehiculo.estado}
                    </span>
                  </td>
                  <td>{formatearFecha(vehiculo.vtv_vencimiento)}</td>
                  <td>{vehiculo.chofer}</td>
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
                        title="Eliminar" 
                        onClick={() => handleEliminarVehiculo(vehiculo.interno)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="100%" className="no-data">
                  <div className="no-data-content">
                    <span>📭</span>
                    <p>No se encontraron vehículos</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
        
        <div className="contador">
          Mostrando {vehiculosFiltrados.length} de {vehiculos.length} vehículos
        </div>
      </section>

      {/* Modales */}
      {isCreateModalOpen && (
        <ModalVehiculo
          mode="crear"
          onClose={closeCreateModal}
          onSave={handleCrearVehiculo}
        />
      )}

      {isViewModalOpen && selectedVehiculo && (
        <ModalVehiculo
          mode="ver"
          vehiculo={selectedVehiculo}
          onClose={closeViewModal}
        />
      )}

      {isEditModalOpen && selectedVehiculo && (
        <ModalVehiculo
          mode="editar"
          vehiculo={selectedVehiculo}
          onClose={closeEditModal}
          onSave={handleActualizarVehiculo}
        />
      )}
    </div>
  );
};

export default HistorialVehicular;
