// FRONTEND/src/pages/flota/FlotaServicio/FlotaServicio.jsx
import React, { useState, useEffect } from 'react';
import { useVehiculos } from '@hooks/useVehiculos';
import ModalVehiculo from '@components/Common/ModalVehiculo';
import ModalDocumentacion from '@components/Common/ModalDocumentacion';
import ColumnSelectorListadoVehiculos from '@components/Common/ColumnSelectorListadoVehiculos';
import CargaMasiva from '@components/Common/CargaMasiva';
import '@assets/css/buttons.css';
import './FlotaServicio.css';

const FlotaServicio = () => {
  const { 
    vehiculos, 
    loading, 
    error, 
    selectedVehiculo,
    createVehiculo, 
    updateVehiculo, 
    deleteVehiculo,
    handleSearch,
    handleSectorFilter,
    handleEstadoFilter,
    handleTipoFilter,
    stats,
    isCreateModalOpen,
    isEditModalOpen,
    isViewModalOpen,
    isDeleteModalOpen,
    isDocumentacionModalOpen,
    openCreateModal,
    openEditModal,
    openViewModal,
    openDeleteModal,
    openDocumentacionModal,
    closeCreateModal,
    closeEditModal,
    closeViewModal,
    closeDeleteModal,
    closeDocumentacionModal
  } = useVehiculos();
  
  // Estados para UI
  const [mostrarColumnSelector, setMostrarColumnSelector] = useState(false);
  const [vehiculosFiltrados, setVehiculosFiltrados] = useState([]);
  const [filtros, setFiltros] = useState({
    buscar: '',
    sector: '',
    estado: '',
    tipo: ''
  });
  
  // Estado para modales
  const [modalAbierto, setModalAbierto] = useState(null); // 'nuevo', 'ver', 'editar', 'documentacion' o null
  
  // Estado para columnas visibles
  const [columnasVisibles, setColumnasVisibles] = useState({
    'interno': true,
    'año': true,
    'dominio': true,
    'modelo': true,
    'eq_incorporado': false,
    'sector': true,
    'chofer': false,
    'estado': true,
    'observaciones': false,
    'vtv_vencimiento': true,
    'vtv_estado': true,
    'hab_vencimiento': false,
    'hab_estado': false,
    'seguro_vencimiento': false,
    'tipo': true,
    'tarjeta_ypf': false
  });
  
  // Estados para Carga Masiva
  const [mostrarCargaMasiva, setMostrarCargaMasiva] = useState(false);
  
  // Plantilla para carga masiva de vehículos
  const vehiculosTemplateFields = [
    'Interno', 'Dominio', 'Modelo', 'Año', 'Tipo', 
    'Sector', 'Estado', 'Chofer', 'VTV Vencimiento'
  ];
  const vehiculosRequiredFields = ['Interno', 'Dominio', 'Modelo'];

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
    
    // Filtro por tipo
    if (filtros.tipo) {
      resultados = resultados.filter(vehiculo => vehiculo.tipo === filtros.tipo);
    }
    
    setVehiculosFiltrados(resultados);
  }, [vehiculos, filtros]);

  // Handlers para modales - Usando funciones del hook
  const abrirModalNuevo = () => {
    setModalAbierto('nuevo');
  };

  const abrirModalVer = (vehiculo) => {
    openViewModal(vehiculo);
    setModalAbierto('ver');
  };

  const abrirModalEditar = (vehiculo) => {
    openEditModal(vehiculo);
    setModalAbierto('editar');
  };

  const abrirModalDocumentacion = (vehiculo) => {
    openDocumentacionModal(vehiculo);
    setModalAbierto('documentacion');
  };

  // Cerrar modal y resetear estado
  const cerrarModal = () => {
    closeCreateModal();
    closeEditModal();
    closeViewModal();
    closeDeleteModal();
    closeDocumentacionModal();
    setModalAbierto(null);
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
  
  // Manejar datos de carga masiva
  const handleDataLoaded = async (data) => {
    try {
      // Normalizar los datos del Excel al formato del formulario
      const normalizedData = data.map(row => ({
        interno: row.Interno || row.interno || '',
        dominio: row.Dominio || row.dominio || '',
        modelo: row.Modelo || row.modelo || '',
        año: row.Año || row.año || row['Año'] || '',
        tipo: row.Tipo || row.tipo || 'Rodado',
        sector: row.Sector || row.sector || '',
        estado: row.Estado || row.estado || 'Activo',
        chofer: row.Chofer || row.chofer || '',
        vtv_vencimiento: row['VTV Vencimiento'] || row.vtv_vencimiento || ''
      }));
      
      // Guardar cada registro
      for (const vehiculoData of normalizedData) {
        await createVehiculo(vehiculoData);
      }
    } catch (error) {
      console.error('Error en carga masiva:', error);
      alert('Error al procesar algunos registros');
    }
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
      case 'en reparación':
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
  const tiposUnicos = [...new Set(vehiculos.map(v => v.tipo).filter(Boolean))];

  // Handler para exportar datos
  const handleExportar = () => {
    if (vehiculosFiltrados.length === 0) {
      alert('⚠️ No hay datos para exportar');
      return;
    }
    
    // Crear CSV
    const headers = ['INTERNO', 'DOMINIO', 'MODELO', 'AÑO', 'TIPO', 'SECTOR', 'ESTADO', 'VTV VTO.', 'CHOFER'];
    const rows = vehiculosFiltrados.map(v => [
      v.interno || '',
      v.dominio || '',
      v.modelo || '',
      v.año || '',
      v.tipo || '',
      v.sector || '',
      v.estado || '',
      formatearFecha(v.vtv_vencimiento),
      v.chofer || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `flota_servicio_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    alert(`✅ Exportados ${vehiculosFiltrados.length} vehículos`);
  };

  if (loading) return <div className="loading">Cargando flota en servicio...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="flota-servicio-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a href="#" onClick={() => window.history.back()}>Dashboard</a>
        <span>🚗 Flota en Servicio</span>
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
          <div className="number">{stats.rodados}</div>
          <div className="label">Rodados</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{stats.maquinarias}</div>
          <div className="label">Maquinarias</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{stats.mantenimiento}</div>
          <div className="label">En Mantenimiento</div>
        </div>
      </div>

      {/* Sección Principal - Matching VehiculosVendidos style */}
      <section className="data-section">
        <div className="section-header">
          <h2 className="section-title">🚗 Flota en Servicio</h2>
          {/* Botón de Carga Masiva - Separado */}
          <div className="carga-masiva-toolbar">
            <button 
              className="purple"
              onClick={() => setMostrarCargaMasiva(true)}
            >
              <span className="btn-icon">📥</span> Carga Masiva
            </button>
          </div>
          <div className="table-toolbar">
            <button 
              className="teal"
              onClick={abrirColumnSelector}
            >
              <span className="btn-icon">⚙️</span> Columnas
            </button>
            <button 
              className="blue"
              onClick={handleExportar}
            >
              <span className="btn-icon">📊</span> Exportar
            </button>
            <button 
              className="green"
              onClick={abrirModalNuevo}
            >
              <span className="btn-icon">+</span> Nuevo Vehículo
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
          <select 
            className="filter-select" 
            value={filtros.tipo}
            onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
          >
            <option value="">Todos los tipos</option>
            {tiposUnicos.map((tipo, index) => (
              <option key={index} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        {/* Tabla - Matching VehiculosVendidos style */}
        <div className="data-table-wrapper">
          <table className="data-table">
          <thead>
            <tr>
              {columnasVisibles.interno && <th>INTERNO</th>}
              {columnasVisibles.dominio && <th>DOMINIO</th>}
              {columnasVisibles.modelo && <th>MODELO</th>}
              {columnasVisibles.año && <th>AÑO</th>}
              {columnasVisibles.tipo && <th>TIPO</th>}
              {columnasVisibles.sector && <th>SECTOR</th>}
              {columnasVisibles.estado && <th>ESTADO</th>}
              {columnasVisibles.vtv_vencimiento && <th>VTV VTO.</th>}
              {columnasVisibles.vtv_estado && <th>VTV ESTADO</th>}
              {columnasVisibles.chofer && <th>CHOFER</th>}
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {vehiculosFiltrados.length > 0 ? (
              vehiculosFiltrados.map(vehiculo => (
                <tr key={vehiculo.interno}>
                  {columnasVisibles.interno && <td>{vehiculo.interno}</td>}
                  {columnasVisibles.dominio && <td>{vehiculo.dominio}</td>}
                  {columnasVisibles.modelo && <td>{vehiculo.modelo}</td>}
                  {columnasVisibles.año && <td>{vehiculo.año}</td>}
                  {columnasVisibles.tipo && (
                    <td>
                      <span className={`status-badge ${vehiculo.tipo === 'Rodado' ? 'status-active' : 'status-warning'}`}>
                        {vehiculo.tipo}
                      </span>
                    </td>
                  )}
                  {columnasVisibles.sector && <td>{vehiculo.sector}</td>}
                  {columnasVisibles.estado && (
                    <td>
                      <span className={`status-badge ${getEstadoClass(vehiculo.estado)}`}>
                        {vehiculo.estado}
                      </span>
                    </td>
                  )}
                  {columnasVisibles.vtv_vencimiento && <td>{formatearFecha(vehiculo.vtv_vencimiento)}</td>}
                  {columnasVisibles.vtv_estado && (
                    <td>
                      <span className={`status-badge ${getEstadoClass(vehiculo.vtv_estado)}`}>
                        {vehiculo.vtv_estado}
                      </span>
                    </td>
                  )}
                  {columnasVisibles.chofer && <td>{vehiculo.chofer}</td>}
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
      {modalAbierto === 'nuevo' && (
        <ModalVehiculo
          mode="crear"
          onClose={cerrarModal}
          onSave={handleCrearVehiculo}
        />
      )}

      {modalAbierto === 'ver' && vehiculoSeleccionado && (
        <ModalVehiculo
          mode="ver"
          vehiculo={vehiculoSeleccionado}
          onClose={cerrarModal}
        />
      )}

      {modalAbierto === 'editar' && vehiculoSeleccionado && (
        <ModalVehiculo
          mode="editar"
          vehiculo={vehiculoSeleccionado}
          onClose={cerrarModal}
          onSave={handleActualizarVehiculo}
        />
      )}

      {modalAbierto === 'documentacion' && vehiculoSeleccionado && (
        <ModalDocumentacion
          vehiculo={vehiculoSeleccionado}
          onClose={cerrarModal}
        />
      )}

      {/* Column Selector Modal */}
      {mostrarColumnSelector && (
        <ColumnSelectorListadoVehiculos
          columnasVisibles={columnasVisibles}
          onToggleColumna={toggleColumna}
          onClose={cerrarColumnSelector}
        />
      )}
      
      {/* Modal de Carga Masiva */}
      <CargaMasiva
        isOpen={mostrarCargaMasiva}
        onClose={() => setMostrarCargaMasiva(false)}
        onDataLoaded={handleDataLoaded}
        title="Carga Masiva de Vehículos"
        templateFields={vehiculosTemplateFields}
        requiredFields={vehiculosRequiredFields}
      />
    </div>
  );
};

export default FlotaServicio;
