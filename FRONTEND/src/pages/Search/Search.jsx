// FRONTEND/src/pages/Search/Search.jsx - Página de Búsqueda Global
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState({
    vehiculos: [],
    personal: [],
    proveedores: [],
    sedes: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm) => {
    setLoading(true);
    setError(null);
    
    try {
      // Buscar en vehículos
      const vehiculosRes = await api.get('/flota/vehiculos', {
        params: { search: searchTerm, limit: 5 }
      });
      
      // Buscar en personal
      const personalRes = await api.get('/personal', {
        params: { search: searchTerm, limit: 5 }
      });
      
      // Buscar en proveedores
      const proveedoresRes = await api.get('/proveedores', {
        params: { search: searchTerm, limit: 5 }
      });
      
      // Buscar en sedes
      const sedesRes = await api.get('/empresas/sedes', {
        params: { search: searchTerm, limit: 5 }
      });
      
      setResults({
        vehiculos: vehiculosRes.data?.data?.vehiculos || vehiculosRes.data?.data || [],
        personal: personalRes.data?.data || personalRes.data || [],
        proveedores: proveedoresRes.data?.data || proveedoresRes.data || [],
        sedes: sedesRes.data?.data || sedesRes.data || []
      });
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError('Error al realizar la búsqueda. Verifique la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const totalResults = 
    results.vehiculos.length + 
    results.personal.length + 
    results.proveedores.length + 
    results.sedes.length;

  return (
    <div className="search-page">
      <div className="breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
        <span>›</span>
        <span>Búsqueda: "{query}"</span>
      </div>

      <div className="search-header">
        <h1>🔍 Resultados de Búsqueda</h1>
        <p>Se encontraron {totalResults} resultados para "<strong>{query}</strong>"</p>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Buscando en el sistema...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p>❌ {error}</p>
        </div>
      )}

      {!loading && !error && totalResults === 0 && (
        <div className="no-results">
          <p>📭 No se encontraron resultados para "{query}"</p>
          <p>Intente con otros términos de búsqueda.</p>
        </div>
      )}

      {!loading && !error && totalResults > 0 && (
        <div className="search-results">
          {/* Vehículos */}
          {results.vehiculos.length > 0 && (
            <div className="result-section">
              <h2>🚗 Vehículos ({results.vehiculos.length})</h2>
              <ul className="result-list">
                {results.vehiculos.map(v => (
                  <li key={v.interno}>
                    <Link to="/flota/flota-servicio">
                      <strong>{v.interno}</strong> - {v.modelo} ({v.dominio})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Personal */}
          {results.personal.length > 0 && (
            <div className="result-section">
              <h2>👥 Personal ({results.personal.length})</h2>
              <ul className="result-list">
                {results.personal.map(p => (
                  <li key={p.id}>
                    <Link to="/personal">
                      <strong>{p.nombre} {p.apellido}</strong> - {p.cargo || p.puesto}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Proveedores */}
          {results.proveedores.length > 0 && (
            <div className="result-section">
              <h2>🏢 Proveedores ({results.proveedores.length})</h2>
              <ul className="result-list">
                {results.proveedores.map(pr => (
                  <li key={pr.id}>
                    <Link to="/proveedores">
                      <strong>{pr.nombre}</strong> - {pr.sector_servicio || pr.sector}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sedes */}
          {results.sedes.length > 0 && (
            <div className="result-section">
              <h2>🏭 Sedes ({results.sedes.length})</h2>
              <ul className="result-list">
                {results.sedes.map(s => (
                  <li key={s.id}>
                    <Link to="/sedes">
                      <strong>{s.nombre}</strong> - {s.direccion || s.localidad}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
