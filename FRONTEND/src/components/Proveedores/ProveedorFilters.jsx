// FRONTEND/src/components/Proveedores/ProveedorFilters.jsx
import React, { useState, useEffect } from 'react';
import './ProveedorFilters.css';

const ProveedorFilters = ({ 
  onSearch, 
  onRubroFilter, 
  onEstadoFilter, 
  onLocalidadFilter,
  onReset,
  filterOptions,
  loading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRubro, setSelectedRubro] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedLocalidad, setSelectedLocalidad] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce para búsqueda (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Ejecutar búsqueda cuando cambia debouncedSearch
  useEffect(() => {
    if (debouncedSearch !== undefined) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch, onSearch]);

  const handleRubroChange = (e) => {
    const rubro = e.target.value;
    setSelectedRubro(rubro);
    onRubroFilter(rubro === 'Todos los rubros' ? '' : rubro);
  };

  const handleEstadoChange = (e) => {
    const estado = e.target.value;
    setSelectedEstado(estado);
    onEstadoFilter(estado === 'Todos los estados' ? '' : estado);
  };

  const handleLocalidadChange = (e) => {
    const localidad = e.target.value;
    setSelectedLocalidad(localidad);
    onLocalidadFilter(localidad === 'Todas las localidades' ? '' : localidad);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedRubro('');
    setSelectedEstado('');
    setSelectedLocalidad('');
    onReset();
  };

  return (
    <div className="proveedor-filters">
      <div className="filters-grid">
        {/* Buscador */}
        <div className="filter-group">
          <label className="filter-label">🔍 Buscar</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Razón social, CUIT, código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Filtro por Rubro */}
        <div className="filter-group">
          <label className="filter-label">🏷️ Rubro</label>
          <select
            className="filter-select"
            value={selectedRubro}
            onChange={handleRubroChange}
            disabled={loading}
          >
            {filterOptions.rubros.map((rubro, index) => (
              <option key={index} value={rubro}>
                {rubro}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Estado */}
        <div className="filter-group">
          <label className="filter-label">📊 Estado</label>
          <select
            className="filter-select"
            value={selectedEstado}
            onChange={handleEstadoChange}
            disabled={loading}
          >
            {filterOptions.estados.map((estado, index) => (
              <option key={index} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Localidad */}
        <div className="filter-group">
          <label className="filter-label">📍 Localidad</label>
          <select
            className="filter-select"
            value={selectedLocalidad}
            onChange={handleLocalidadChange}
            disabled={loading}
          >
            {filterOptions.localidades.map((localidad, index) => (
              <option key={index} value={localidad}>
                {localidad}
              </option>
            ))}
          </select>
        </div>

        {/* Botón Reset */}
        <div className="filter-group filter-actions">
          <button
            className="btn btn-secondary btn-reset"
            onClick={handleReset}
            disabled={loading}
          >
            🗑️ Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {(searchTerm || selectedRubro !== 'Todos los rubros' || 
        selectedEstado !== 'Todos los estados' || selectedLocalidad !== 'Todas las localidades') && (
        <div className="active-filters">
          <span className="active-filters-label">Filtros activos:</span>
          {searchTerm && (
            <span className="filter-chip">
              🔍 "{searchTerm}"
              <button className="chip-remove" onClick={() => setSearchTerm('')}>×</button>
            </span>
          )}
          {selectedRubro && selectedRubro !== 'Todos los rubros' && (
            <span className="filter-chip">
              🏷️ {selectedRubro}
              <button className="chip-remove" onClick={() => setSelectedRubro('Todos los rubros')}>×</button>
            </span>
          )}
          {selectedEstado && selectedEstado !== 'Todos los estados' && (
            <span className="filter-chip">
              📊 {selectedEstado}
              <button className="chip-remove" onClick={() => setSelectedEstado('Todos los estados')}>×</button>
            </span>
          )}
          {selectedLocalidad && selectedLocalidad !== 'Todas las localidades' && (
            <span className="filter-chip">
              📍 {selectedLocalidad}
              <button className="chip-remove" onClick={() => setSelectedLocalidad('Todas las localidades')}>×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProveedorFilters;