import React, { useState, useEffect, useMemo } from 'react'
import './RodadoTable.css'

const RodadoTable = ({ 
  vehiculos = [], 
  columnasVisibles = {}, 
  onVerVehiculo,
  // Eliminar props no utilizadas o implementarlas
  onSearch,
  onSectorFilter,
  onEstadoFilter,
  onTipoFilter
}) => {
  const [filtros, setFiltros] = useState({
    buscar: '',
    sector: '',
    estado: ''
  })

  // Columnas por defecto
  const defaultColumnas = {
    interno: true,
    anio: true, // Cambiado de 'año' a 'anio' para consistencia
    dominio: true,
    modelo: true,
    'eq-incorporado': false,
    sector: true,
    chofer: false,
    estado: true,
    observaciones: false,
    'vtv-vencimiento': false,
    'vtv-ev': false,
    'habilitacion-vencimiento': false,
    'habilitacion-eh': false,
    'tipo-seguro': false,
    'seguro-tecnico': false,
    'seguro-cargas': false
  }

  // Combinar columnas con defaults
  const columnas = useMemo(() => ({
    ...defaultColumnas,
    ...columnasVisibles
  }), [columnasVisibles])

  // Filtrar vehículos con useMemo para mejor performance
  const vehiculosFiltrados = useMemo(() => {
    let filtrados = vehiculos

    if (filtros.buscar) {
      const busqueda = filtros.buscar.toLowerCase()
      filtrados = filtrados.filter(v => 
        v.interno?.toLowerCase().includes(busqueda) ||
        v.dominio?.toLowerCase().includes(busqueda) ||
        v.modelo?.toLowerCase().includes(busqueda) ||
        (v.chofer && v.chofer.toLowerCase().includes(busqueda))
      )
    }

    if (filtros.sector) {
      filtrados = filtrados.filter(v => v.sector === filtros.sector)
    }

    if (filtros.estado) {
      filtrados = filtrados.filter(v => v.estado === filtros.estado)
    }

    return filtrados
  }, [vehiculos, filtros])

  const getEstadoClass = (estado) => {
    if (!estado) return ''
    switch(estado.toLowerCase()) {
      case 'activo':
      case 'vigente':
        return 'status-active'
      case 'por vencer':
      case 'mantenimiento':
        return 'status-warning'
      case 'vencido':
      case 'inactivo':
        return 'status-expired'
      default:
        return ''
    }
  }

  const formatearFecha = (fechaString) => {
    if (!fechaString) return ''
    try {
      const fecha = new Date(fechaString)
      return fecha.toLocaleDateString('es-AR')
    } catch (e) {
      return fechaString
    }
  }

  // Manejar cambios en filtros
  const handleBuscarChange = (e) => {
    const value = e.target.value
    setFiltros(prev => ({ ...prev, buscar: value }))
    if (onSearch) onSearch(value)
  }

  const handleSectorChange = (e) => {
    const value = e.target.value
    setFiltros(prev => ({ ...prev, sector: value }))
    if (onSectorFilter) onSectorFilter(value)
  }

  const handleEstadoChange = (e) => {
    const value = e.target.value
    setFiltros(prev => ({ ...prev, estado: value }))
    if (onEstadoFilter) onEstadoFilter(value)
  }

  // Extraer sectores únicos para el dropdown
  const sectoresUnicos = useMemo(() => {
    const sectores = vehiculos
      .map(v => v.sector)
      .filter((sector, index, self) => sector && self.indexOf(sector) === index)
    return ['', 'Todos los sectores', ...sectores]
  }, [vehiculos])

  // Extraer estados únicos para el dropdown
  const estadosUnicos = useMemo(() => {
    const estados = vehiculos
      .map(v => v.estado)
      .filter((estado, index, self) => estado && self.indexOf(estado) === index)
    return ['', 'Todos los estados', ...estados]
  }, [vehiculos])

  return (
    <div className="rodado-table-container">
      <div className="filter-bar">
        <input 
          type="text" 
          className="filter-select" 
          placeholder="Buscar..." 
          value={filtros.buscar}
          onChange={handleBuscarChange}
        />
        <select 
          className="filter-select"
          value={filtros.sector}
          onChange={handleSectorChange}
        >
          {sectoresUnicos.map((sector, index) => (
            <option key={index} value={index === 0 ? '' : sector}>
              {sector}
            </option>
          ))}
        </select>
        <select 
          className="filter-select"
          value={filtros.estado}
          onChange={handleEstadoChange}
        >
          {estadosUnicos.map((estado, index) => (
            <option key={index} value={index === 0 ? '' : estado}>
              {estado}
            </option>
          ))}
        </select>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {columnas.interno && <th className="col-interno">INT.</th>}
              {columnas.anio && <th className="col-anio">AÑO</th>}
              {columnas.dominio && <th className="col-dominio">DOMINIO</th>}
              {columnas.modelo && <th className="col-modelo">MODELO</th>}
              {columnas['eq-incorporado'] && <th className="col-eq-incorporado">EQ. INCORPORADO</th>}
              {columnas.sector && <th className="col-sector">SECTOR</th>}
              {columnas.chofer && <th className="col-chofer">CHOFER</th>}
              {columnas.estado && <th className="col-estado">ESTADO</th>}
              {columnas.observaciones && <th className="col-observaciones">OBSERVACIONES</th>}
              {columnas['vtv-vencimiento'] && <th className="col-vtv-vencimiento">VTV VTO.</th>}
              {columnas['vtv-ev'] && <th className="col-vtv-ev">VTV EV</th>}
              {columnas['habilitacion-vencimiento'] && <th className="col-habilitacion-vencimiento">HAB. VTO.</th>}
              {columnas['habilitacion-eh'] && <th className="col-habilitacion-eh">HAB. EH</th>}
              {columnas['tipo-seguro'] && <th className="col-tipo-seguro">TIPO SEGURO</th>}
              {columnas['seguro-tecnico'] && <th className="col-seguro-tecnico">SEG. TÉCNICO</th>}
              {columnas['seguro-cargas'] && <th className="col-seguro-cargas">SEG. CARGAS PEL.</th>}
              <th className="col-acciones">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {vehiculosFiltrados.length > 0 ? (
              vehiculosFiltrados.map(vehiculo => (
                <tr key={vehiculo.id}>
                  {columnas.interno && <td className="col-interno">{vehiculo.interno}</td>}
                  {columnas.anio && <td className="col-anio">{vehiculo.anio}</td>}
                  {columnas.dominio && <td className="col-dominio">{vehiculo.dominio}</td>}
                  {columnas.modelo && <td className="col-modelo">{vehiculo.modelo}</td>}
                  {columnas['eq-incorporado'] && <td className="col-eq-incorporado">{vehiculo.eqIncorporado || ''}</td>}
                  {columnas.sector && <td className="col-sector">{vehiculo.sector}</td>}
                  {columnas.chofer && <td className="col-chofer">{vehiculo.chofer || ''}</td>}
                  {columnas.estado && (
                    <td className="col-estado">
                      <span className={`status-badge ${getEstadoClass(vehiculo.estado)}`}>
                        {vehiculo.estado}
                      </span>
                    </td>
                  )}
                  {columnas.observaciones && <td className="col-observaciones">{vehiculo.observaciones || ''}</td>}
                  {columnas['vtv-vencimiento'] && <td className="col-vtv-vencimiento">{formatearFecha(vehiculo.vtvVencimiento)}</td>}
                  {columnas['vtv-ev'] && (
                    <td className="col-vtv-ev">
                      <span className={`status-badge ${getEstadoClass(vehiculo.vtvEstado)}`}>
                        {vehiculo.vtvEstado || ''}
                      </span>
                    </td>
                  )}
                  {columnas['habilitacion-vencimiento'] && <td className="col-habilitacion-vencimiento">{formatearFecha(vehiculo.habilitacionVencimiento)}</td>}
                  {columnas['habilitacion-eh'] && (
                    <td className="col-habilitacion-eh">
                      <span className={`status-badge ${getEstadoClass(vehiculo.habilitacionEstado)}`}>
                        {vehiculo.habilitacionEstado || ''}
                      </span>
                    </td>
                  )}
                  {columnas['tipo-seguro'] && <td className="col-tipo-seguro">{vehiculo.tipoSeguro || ''}</td>}
                  {columnas['seguro-tecnico'] && (
                    <td className="col-seguro-tecnico">
                      <span className={`status-badge ${getEstadoClass(vehiculo.seguroTecnico)}`}>
                        {vehiculo.seguroTecnico || ''}
                      </span>
                    </td>
                  )}
                  {columnas['seguro-cargas'] && (
                    <td className="col-seguro-cargas">
                      <span className={`status-badge ${getEstadoClass(vehiculo.seguroCargas)}`}>
                        {vehiculo.seguroCargas || ''}
                      </span>
                    </td>
                  )}
                  <td className="col-acciones">
                    <div className="action-buttons">
                      <button 
                        className="icon-btn" 
                        title="Ver"
                        onClick={() => onVerVehiculo && onVerVehiculo(vehiculo)}
                      >
                        👁️
                      </button>
                      <button className="icon-btn" title="Editar">✏️</button>
                      <button className="icon-btn" title="Documentación">📄</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="100%" className="no-data">
                  No se encontraron vehículos con los filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="contador">
        Mostrando {vehiculosFiltrados.length} de {vehiculos.length} vehículos
      </div>
    </div>
  )
}

export default RodadoTable