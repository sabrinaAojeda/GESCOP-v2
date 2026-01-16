import React, { useState, useEffect } from 'react';

const PersonalFilters = ({ onSearch, onSectorFilter, onEstadoFilter, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleSectorChange = (e) => {
    const sector = e.target.value;
    setSelectedSector(sector);
    onSectorFilter(sector);
  };

  const handleEstadoChange = (e) => {
    const estado = e.target.value;
    setSelectedEstado(estado);
    onEstadoFilter(estado);
  };

  const sectors = ['Todos los sectores', 'Logística', 'Producción', 'Administración', 'Mantenimiento'];
  const estados = ['Todos los estados', 'Activo', 'Inactivo'];

  return (
    <div className="filter-bar">
      <input
        type="text"
        className="filter-select"
        placeholder="Buscar empleado..."
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
        {sectors.map(sector => (
          <option key={sector} value={sector}>{sector}</option>
        ))}
      </select>
      
      <select
        className="filter-select"
        value={selectedEstado}
        onChange={handleEstadoChange}
        disabled={loading}
      >
        {estados.map(estado => (
          <option key={estado} value={estado}>{estado}</option>
        ))}
      </select>
    </div>
  );
};

export default PersonalFilters;