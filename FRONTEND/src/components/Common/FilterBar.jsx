// src/components/Common/FilterBar.jsx - COMPONENTE UNIFICADO DE BARRAS DE FILTROS
import React, { useState, useEffect } from 'react';
import './FilterBar.css';

const FilterBar = ({ 
  onSearch, 
  onFilter, 
  onReset, 
  filters = [],
  placeholder = 'Buscar...',
  loading = false,
  showReset = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  // Sincronizar filtros activos
  useEffect(() => {
    const newActiveFilters = {};
    filters.forEach(filter => {
      if (filter.value !== '' && filter.value !== 'todos') {
        newActiveFilters[filter.name] = true;
      }
    });
    setActiveFilters(newActiveFilters);
  }, [filters]);

  const handleFilterChange = (filterName, value, onChange) => {
    if (onChange) {
      onChange(value);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setActiveFilters({});
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="filter-bar">
      <div className="filter-bar-search">
        <input
          type="text"
          className="filter-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div className="filter-bar-filters">
        {filters.map((filter, index) => (
          <div key={`${filter.name}-${index}`} className="filter-group">
            {filter.label && (
              <label className="filter-label">{filter.label}</label>
            )}
            <select
              className="filter-select"
              value={filter.value}
              onChange={(e) => handleFilterChange(filter.name, e.target.value, filter.onChange)}
              disabled={loading || filter.disabled}
            >
              {filter.options.map((option, optIndex) => (
                <option key={optIndex} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {showReset && (Object.keys(activeFilters).length > 0 || searchTerm) && (
        <div className="filter-bar-reset">
          <button 
            className="filter-reset-btn"
            onClick={handleReset}
            disabled={loading}
          >
            🔄 Reiniciar
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
