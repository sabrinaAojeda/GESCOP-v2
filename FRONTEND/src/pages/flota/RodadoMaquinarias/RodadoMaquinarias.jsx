// src/pages/flota/RodadoMaquinarias/RodadoMaquinarias.jsx
import React, { useState } from 'react';
import RodadoTable from '../../../components/Sidebar/RodadoTable';
import { useListadoVehiculos } from '@hooks/useListadoVehiculos';
import ModalVehiculo from '../../../components/Common/ModalVehiculo'; 
import ModalDocumentacion from '../../../components/Common/ModalDocumentacion';
import './RodadoMaquinarias.css';

const RodadoMaquinarias = () => {
  // Usar el hook real que conecta con el backend
  const { 
    vehiculos, 
    loading, 
    error, 
    agregarVehiculo, 
    actualizarVehiculo,
    eliminarVehiculo,
    handleSearch,
    handleSectorFilter,
    handleEstadoFilter,
    handleTipoFilter 
  } = useListadoVehiculos();

  const [modalAbierto, setModalAbierto] = useState(null);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  
  // Handlers para modales
  const abrirModalVer = (vehiculo) => {
    setModalAbierto('ver');
    setVehiculoSeleccionado(vehiculo);
  };

  const abrirModalEditar = (vehiculo) => {
    setModalAbierto('editar');
    setVehiculoSeleccionado(vehiculo);
  };

  const abrirModalDocumentacion = (vehiculo) => {
    setModalAbierto('documentacion');
    setVehiculoSeleccionado(vehiculo);
  };

  const abrirModalNuevo = () => {
    setModalAbierto('nuevo');
    setVehiculoSeleccionado(null);
  };

  const cerrarModal = () => {
    setModalAbierto(null);
    setVehiculoSeleccionado(null);
  };

  // Handlers para CRUD
  const handleCrearVehiculo = async (datosVehiculo) => {
    try {
      const resultado = await agregarVehiculo(datosVehiculo);
      if (resultado.success) {
        alert('Vehículo creado correctamente');
        cerrarModal();
      } else {
        alert(`Error: ${resultado.error}`);
      }
    } catch (err) {
      alert('Error al crear vehículo');
    }
  };

  const handleActualizarVehiculo = async (datosVehiculo) => {
    if (!vehiculoSeleccionado) return;
    
    try {
      const resultado = await actualizarVehiculo(vehiculoSeleccionado.interno, datosVehiculo);
      if (resultado.success) {
        alert('Vehículo actualizado correctamente');
        cerrarModal();
      } else {
        alert(`Error: ${resultado.error}`);
      }
    } catch (err) {
      alert('Error al actualizar vehículo');
    }
  };

  const handleEliminarVehiculo = async (interno) => {
    const vehiculo = vehiculos.find(v => v.interno === interno);
    if (vehiculo && window.confirm(`¿Está seguro de eliminar el vehículo ${vehiculo.modelo} (${vehiculo.dominio})?`)) {
      const resultado = await eliminarVehiculo(interno);
      if (resultado.success) {
        alert('Vehículo eliminado correctamente');
      } else {
        alert(`Error: ${resultado.error}`);
      }
    }
  };

  // Función para ver detalles (modo de solo lectura)
  const renderModalVer = () => (
    <div className="modal-vehiculo-overlay">
      <div className="modal-vehiculo-content">
        <div className="modal-vehiculo-header">
          <h2 className="modal-vehiculo-title">👁️ Detalles del Vehículo</h2>
          <button className="modal-vehiculo-close" onClick={cerrarModal}>×</button>
        </div>
        
        <div className="vehicle-details-modal">
          {vehiculoSeleccionado && (
            <>
              <div className="vehicle-details-grid">
                <div>
                  <div className="detail-group">
                    <div className="detail-label">Interno</div>
                    <div className="detail-value">{vehiculoSeleccionado.interno}</div>
                  </div>
                  <div className="detail-group">
                    <div className="detail-label">Año</div>
                    <div className="detail-value">{vehiculoSeleccionado.año}</div>
                  </div>
                  <div className="detail-group">
                    <div className="detail-label">Dominio</div>
                    <div className="detail-value">{vehiculoSeleccionado.dominio}</div>
                  </div>
                  <div className="detail-group">
                    <div className="detail-label">Modelo</div>
                    <div className="detail-value">{vehiculoSeleccionado.modelo}</div>
                  </div>
                </div>
                <div>
                  <div className="detail-group">
                    <div className="detail-label">Sector</div>
                    <div className="detail-value">{vehiculoSeleccionado.sector}</div>
                  </div>
                  <div className="detail-group">
                    <div className="detail-label">Chofer</div>
                    <div className="detail-value">{vehiculoSeleccionado.chofer || 'No asignado'}</div>
                  </div>
                  <div className="detail-group">
                    <div className="detail-label">Estado</div>
                    <div className="detail-value">{vehiculoSeleccionado.estado}</div>
                  </div>
                  <div className="detail-group">
                    <div className="detail-label">Tipo</div>
                    <div className="detail-value">{vehiculoSeleccionado.tipo}</div>
                  </div>
                </div>
              </div>
              
              <div className="modal-vehiculo-actions">
                <button className="btn btn-secondary" onClick={cerrarModal}>
                  Cerrar
                </button>
                <button className="btn btn-primary" onClick={() => {
                  cerrarModal();
                  setTimeout(() => abrirModalEditar(vehiculoSeleccionado), 300);
                }}>
                  Editar Vehículo
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="loading">Cargando vehículos...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="rodado-maquinarias-page">
      <div className="page-header">
        <h1 className="page-title">🚗 Rodados y Maquinarias</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={abrirModalNuevo}>
            <span>+</span> Nuevo Vehículo
          </button>
        </div>
      </div>

      <RodadoTable 
        vehiculos={vehiculos}
        columnasVisibles={{
          interno: true,
          año: true,
          dominio: true,
          modelo: true,
          eq_incorporado: false,
          sector: true,
          chofer: false,
          estado: true,
          observaciones: false,
          vtv_vencimiento: false,
          vtv_estado: false,
          hab_vencimiento: false,
          hab_estado: false,
          seguro_vencimiento: false,
          tipo: true
        }}
        onVerVehiculo={abrirModalVer}
        onEditarVehiculo={abrirModalEditar}
        onEliminarVehiculo={handleEliminarVehiculo}
        onDocumentacion={abrirModalDocumentacion}
        onSearch={handleSearch}
        onSectorFilter={handleSectorFilter}
        onEstadoFilter={handleEstadoFilter}
        onTipoFilter={handleTipoFilter}
      />

      {/* Modales */}
      {modalAbierto === 'nuevo' && (
        <ModalVehiculo
          mode="crear"
          onClose={cerrarModal}
          onSave={handleCrearVehiculo}
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

      {modalAbierto === 'ver' && vehiculoSeleccionado && renderModalVer()}

      {modalAbierto === 'documentacion' && vehiculoSeleccionado && (
        <ModalDocumentacion
          vehiculo={vehiculoSeleccionado}
          onClose={cerrarModal}
          onSave={() => {}}
        />
      )}
    </div>
  );
};

export default RodadoMaquinarias;